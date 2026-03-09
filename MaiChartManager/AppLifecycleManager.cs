using System.ComponentModel;

namespace MaiChartManager;

public static class AppLifecycleManager
{
    /// <summary>
    /// 托盘图标逻辑：
    /// 只有 开机启动 并且是局域网模式的时候，才显示。别的时候都不显示
    /// 其实不是局域网模式的时候不应该允许开机启动
    /// </summary>
    private static NotifyIcon? _trayIcon;

    public static bool HasTrayIcon => _trayIcon?.Visible == true;

    public static void ShowTrayIcon()
    {
        AppMain.UiContext?.Post(_ =>
        {
            if (_trayIcon != null && _trayIcon.Visible)
                return;

            // Load icon from Launcher's embedded resources (avoids duplicating base64 data)
            var rm = new ComponentResourceManager(typeof(Launcher));
var icon = (Icon?)rm.GetObject("notifyIcon1.Icon");

            var contextMenu = new ContextMenuStrip();
            var openItem = new ToolStripMenuItem("打开窗口");
            openItem.Click += (_, _) => { var url = ServerManager.GetLoopbackUrl(); if (url != null) ShowBrowser(url); };
            var exitItem = new ToolStripMenuItem("退出");
            exitItem.Click += (_, _) =>
            {
                // Dispose tray icon directly here (we're already on UI thread via the click handler)
                _trayIcon?.Dispose();
                _trayIcon = null;
                Application.Exit();
            };
            contextMenu.Items.Add(openItem);
            contextMenu.Items.Add(exitItem);

            _trayIcon = new NotifyIcon
            {
                Icon = icon,
                Text = "MaiChartManager",
                ContextMenuStrip = contextMenu,
                Visible = true,
            };

            _trayIcon.MouseClick += (_, e) =>
            {
                if (e.Button == MouseButtons.Left) { var url = ServerManager.GetLoopbackUrl(); if (url != null) ShowBrowser(url); }
            };
        }, null);
    }

    public static void DisposeTrayIcon()
    {
        AppMain.UiContext?.Post(_ =>
        {
            _trayIcon?.Dispose();
            _trayIcon = null;
        }, null);
    }

    public static void CheckShouldExit()
    {
        var browserAlive = AppMain.BrowserWin is { IsDisposed: false };
        var oobeAlive = AppMain.OobeBrowser is { IsDisposed: false };
        if (!browserAlive && !oobeAlive && !HasTrayIcon)
        {
            Application.Exit();
        }
    }

    public static void ShowBrowser(string loopbackUrl)
    {
        AppMain.UiContext?.Post(_ =>
        {
            if (AppMain.BrowserWin is { IsDisposed: false })
            {
                AppMain.BrowserWin.Activate();
            }
            else
            {
                AppMain.BrowserWin = new Browser(loopbackUrl);
                AppMain.BrowserWin.Show();
            }
        }, null);
    }

    public static void GoToModeSwitch(string loopbackUrl, string hash = "/set-mode")
    {
        AppMain.UiContext?.Post(_ =>
        {
            // Close existing Browser window
            if (AppMain.BrowserWin is { IsDisposed: false })
            {
                AppMain.BrowserWin.Dispose();
                AppMain.BrowserWin = null;
            }

            // Close existing OobeBrowser if any
            if (AppMain.OobeBrowser is { IsDisposed: false })
            {
                AppMain.OobeBrowser.Dispose();
                AppMain.OobeBrowser = null;
            }

            AppMain.OobeBrowser = new OobeBrowser(loopbackUrl, hash);
            AppMain.OobeBrowser.Show();
            AppMain.OobeBrowser.Activate();
        }, null);
    }
}
