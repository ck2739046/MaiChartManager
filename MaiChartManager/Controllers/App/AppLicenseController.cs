using Windows.Services.Store;
using Microsoft.AspNetCore.Mvc;

namespace MaiChartManager.Controllers.App;

[ApiController]
[Route("MaiChartManagerServlet/[action]Api")]
public class AppLicenseController : Controller
{
    public record RequestPurchaseResult(string? ErrorMessage, StorePurchaseStatus Status);

    [HttpPost]
    public async Task<RequestPurchaseResult> RequestPurchase()
    {
        var res = await IapManager.Purchase();
        if (res.ExtendedError is not null)
        {
            return new RequestPurchaseResult(res.ExtendedError.Message, res.Status);
        }

        return new RequestPurchaseResult(null, res.Status);
    }

    [HttpPost]
    public async Task<bool> VerifyOfflineKey([FromBody] string key)
    {
        var result = await OfflineReg.VerifyAsync(key);
        if (!result.IsValid) return false;

        StaticSettings.Config.OfflineKey = key;
        StaticSettings.Config.Save();
        IapManager.SetOfflineLicenseActive();
        return true;
    }
}