using Vanara.Windows.Shell;

namespace MaiChartManager.Utils;

public static class WinUtils
{
    public static void SetTaskbarProgress(ulong progress, ulong total = 100)
    {
        var win = AppMain.ActiveForm ?? AppMain.BrowserWin;
        if (win == null) return;
        try
        {
            TaskbarList.SetProgressState(win.Handle, TaskbarButtonProgressState.Normal);
            TaskbarList.SetProgressValue(win.Handle, progress, total);
        }
        catch
        {
            // ignored
        }
    }

    public static void ClearTaskbarProgress()
    {
        var win = AppMain.ActiveForm ?? AppMain.BrowserWin;
        if (win == null) return;
        try
        {
            TaskbarList.SetProgressState(win.Handle, TaskbarButtonProgressState.None);
        }
        catch
        {
            // ignored
        }
    }

    public static void SetTaskbarProgressIndeterminate()
    {
        var win = AppMain.ActiveForm ?? AppMain.BrowserWin;
        if (win == null) return;
        try
        {
            TaskbarList.SetProgressState(win.Handle, TaskbarButtonProgressState.Indeterminate);
        }
        catch
        {
            // ignored
        }
    }

    public static DialogResult ShowDialog(CommonDialog dialog)
    {
        var owner = AppMain.ActiveForm ?? AppMain.BrowserWin;
        if (owner == null) return DialogResult.Cancel;
        return owner.Invoke(() => dialog.ShowDialog(owner));
    }
}