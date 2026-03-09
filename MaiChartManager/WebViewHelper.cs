using Microsoft.Web.WebView2.Core;

namespace MaiChartManager;

/// <summary>
/// Browser 和 OobeBrowser 共享的 WebView2 工具方法
/// </summary>
public static class WebViewHelper
{
    public static Point CalculatePosition(int width, int height)
    {
        var landscape = Screen.AllScreens.FirstOrDefault(s => s.WorkingArea.Width >= s.WorkingArea.Height);
        if (landscape != null)
        {
            var area = landscape.WorkingArea;
            return new Point(
                area.X + (area.Width - width) / 2,
                area.Y + (area.Height - height) / 2
            );
        }

        var portrait = Screen.PrimaryScreen ?? Screen.AllScreens[0];
        var pArea = portrait.WorkingArea;
        var squareSize = pArea.Width;
        var squareTop = pArea.Bottom - squareSize;
        return new Point(
            pArea.X + (squareSize - width) / 2,
            squareTop + (squareSize - height) / 2
        );
    }

    public static void SetupCoreWebView2(CoreWebView2 coreWebView2, Uri? loopbackUrl)
    {
        coreWebView2.SetVirtualHostNameToFolderMapping("mcm.invalid", StaticSettings.wwwroot, CoreWebView2HostResourceAccessKind.Deny);
        if (loopbackUrl != null)
            coreWebView2.AddScriptToExecuteOnDocumentCreatedAsync($"globalThis.backendUrl = `{loopbackUrl.ToString().TrimEnd('/')}`");
    }

    public static void OnPermissionRequested(object? sender, CoreWebView2PermissionRequestedEventArgs e)
    {
        if (e.PermissionKind is CoreWebView2PermissionKind.FileReadWrite or CoreWebView2PermissionKind.Autoplay)
        {
            e.State = CoreWebView2PermissionState.Allow;
        }
    }
}
