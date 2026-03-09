using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Windows.Forms;
using Microsoft.AspNetCore.Mvc;

namespace MaiChartManager.Controllers.App;

public record CompleteSetupRequest(bool Export, bool UseAuth, string? AuthUsername, string? AuthPassword, bool StartupEnabled = false);

[ApiController]
[Route("MaiChartManagerServlet/[action]Api")]
public class OobeController(StaticSettings settings, ILogger<OobeController> logger) : ControllerBase
{
    [HttpGet]
    public string? GetGamePath()
    {
        return StaticSettings.Config.GamePath;
    }

    [HttpPost]
    public IActionResult SetGamePath([FromBody] string path, bool save = false)
    {
        if (!Path.Exists(path))
        {
            return BadRequest("Path does not exist");
        }

        StaticSettings.GamePath = path;
        if (!Directory.Exists(StaticSettings.StreamingAssets) && Directory.Exists(Path.Combine(StaticSettings.GamePath, "Package")))
        {
            StaticSettings.GamePath = Path.Combine(StaticSettings.GamePath, "Package");
        }

        if (!Directory.Exists(StaticSettings.StreamingAssets))
        {
            return BadRequest("StreamingAssets not found. Not a valid game directory.");
        }

        StaticSettings.Config.GamePath = StaticSettings.GamePath;
        StaticSettings.Config.HistoryPath.Add(path);
        if (save)
        {
            // oobe 阶段不需要保存，下面会保存。但是在主界面设置里需要保存
            StaticSettings.Config.Save();
        }

        AppMain.UiContext?.Post(_ =>
        {
            if (AppMain.BrowserWin is { IsDisposed: false })
                AppMain.BrowserWin.Text = $"MaiChartManager ({StaticSettings.GamePath})";
        }, null);

        return Ok();
    }

    [HttpGet]
    public HashSet<string> GetGamePathHistory()
    {
        return StaticSettings.Config.HistoryPath;
    }

    [HttpPost]
    public IActionResult DeleteGamePathHistory([FromBody] string path)
    {
        StaticSettings.Config.HistoryPath.Remove(path);
        StaticSettings.Config.Save();
        return Ok();
    }

    [HttpPost]
    public async Task InitializeGameData()
    {
        await settings.InitializeGameData();
    }

    [HttpGet]
    public string? OpenFolderDialog()
    {
        string? result = null;
        AppMain.UiContext?.Send(_ =>
        {
            var dialog = new FolderBrowserDialog
            {
                ShowNewFolderButton = false,
            };
            if (dialog.ShowDialog(AppMain.ActiveForm) == DialogResult.OK)
            {
                result = dialog.SelectedPath;
            }
        }, null);
        return result;
    }

    [HttpGet]
    public List<string> GetLanAddresses()
    {
        return Dns.GetHostAddresses(Dns.GetHostName())
            .Where(it => it.AddressFamily == AddressFamily.InterNetwork)
            .Select(it => it.ToString())
            .ToList();
    }

    [HttpPost]
    public async Task<IActionResult> CompleteSetup([FromBody] CompleteSetupRequest request)
    {
        var exportChanged = request.Export != StaticSettings.Config.Export;
        StaticSettings.Config.Export = request.Export;
        StaticSettings.Config.UseAuth = request.UseAuth;
        StaticSettings.Config.AuthUsername = request.AuthUsername ?? "";
        StaticSettings.Config.AuthPassword = request.AuthPassword ?? "";
        StaticSettings.Config.Save();

        if (exportChanged)
        {
            AppLifecycleManager.DisposeTrayIcon();
            // 管理开机启动
            try
            {
                var startupTask = await Windows.ApplicationModel.StartupTask.GetAsync("MaiChartManagerStartupId");
                if (request.Export && request.StartupEnabled)
                    await startupTask.RequestEnableAsync();
                else
                    startupTask.Disable();
            }
            catch { }
            _ = Task.Run(async () =>
            {
                await Task.Delay(100);
                if (ServerManager.IsRunning)
                {
                    await ServerManager.StopAsync();
                }
                ServerManager.StartApp(request.Export, (url) =>
                {
                    if (StaticSettings.Config.Export) return;
                    AppLifecycleManager.ShowBrowser(url);
                    AppMain.UiContext?.Post(_ =>
                    {
                        AppMain.OobeBrowser?.Dispose();
                        AppMain.OobeBrowser = null;
                    }, null);
                });
            });
        }
        else if (!request.Export)
        {
            AppLifecycleManager.ShowBrowser(ServerManager.GetLoopbackUrl() ?? throw new InvalidOperationException("Loopback URL is null"));
            AppMain.UiContext?.Post(_ =>
            {
                AppMain.OobeBrowser?.Dispose();
                AppMain.OobeBrowser = null;
            }, null);
        }

        return Ok();
    }

    [HttpPost]
    public void OpenMainUI()
    {
        AppLifecycleManager.ShowBrowser(ServerManager.GetLoopbackUrl() ?? throw new InvalidOperationException("Loopback URL is null"));
    }

    [HttpPost]
    public void SwitchToSetMode()
    {
        var url = ServerManager.GetLoopbackUrl() ?? throw new InvalidOperationException("Loopback URL is null");
        AppLifecycleManager.GoToModeSwitch(url);
    }
}
