using Microsoft.AspNetCore.Mvc;

namespace MaiChartManager.Controllers.Mod;

public record MuModConfigDto(string Channel, string CachePath);
public record SetChannelDto(string Channel);
public record EnsureCacheResultDto(bool Success, string? Version, string? Error);

[ApiController]
[Route("MaiChartManagerServlet/[action]Api")]
public class MuModController(MuModService muModService) : ControllerBase
{
    [HttpGet]
    public MuModConfigDto GetMuModConfig()
    {
        var config = muModService.ReadConfig();
        return new MuModConfigDto(config.Channel, config.CachePath);
    }

    [HttpPut]
    public async Task<EnsureCacheResultDto> SetMuModChannelAndEnsureCache([FromBody] SetChannelDto req)
    {
        try
        {
            if (req.Channel != "slow" && req.Channel != "fast")
            {
                return new EnsureCacheResultDto(false, null, "Channel must be 'slow' or 'fast'");
            }
            muModService.WriteChannel(req.Channel);
            var result = await muModService.EnsureCache(CancellationToken.None);
            return new EnsureCacheResultDto(result.Success, result.Version, result.Error);
        }
        catch (Exception e)
        {
            return new EnsureCacheResultDto(false, null, e.Message);
        }
    }

    [HttpPost]
    public async Task<EnsureCacheResultDto> EnsureMuModCache()
    {
        try
        {
            var result = await muModService.EnsureCache(CancellationToken.None);
            return new EnsureCacheResultDto(result.Success, result.Version, result.Error);
        }
        catch (Exception e)
        {
            return new EnsureCacheResultDto(false, null, e.Message);
        }
    }
}
