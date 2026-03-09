using AquaMai.Config.HeadlessLoader;
using AquaMai.Config.Interfaces;
using MaiChartManager.Utils;

namespace MaiChartManager.Controllers.Mod;

public class ModConfigService
{
    private readonly MuModService _muModService;

    public ModConfigService(MuModService muModService)
    {
        _muModService = muModService;
    }

    public class UnsupportedConfigApiVersionException() : Exception(Locale.UnsupportedConfigVersion);

    public class ConfigCorruptedException() : Exception(Locale.AquaMaiConfigCorrupted);

    public class AquaMaiNotInstalledException() : Exception(Locale.AquaMaiNotInstalled);

    public class AquaMaiSignatureVerificationFailedException() : Exception("AquaMaiSignatureVerificationFailed");

    public void CheckConfigApiVersion(HeadlessConfigInterface configInterface)
    {
        var currentSupportedApiVersion = new Version(1, 1);
        var configApiVersion = new Version(configInterface.ApiVersion);
        if (currentSupportedApiVersion.Major != configApiVersion.Major)
        {
            throw new UnsupportedConfigApiVersionException();
        }

        if (currentSupportedApiVersion.Minor > configApiVersion.Minor)
        {
            throw new UnsupportedConfigApiVersionException();
        }
    }

    public async Task<string> GetAquaMaiDllPath(CancellationToken ct = default)
    {
        var muModInstalled = _muModService.IsMuModInstalled();
        var aquaMaiInstalled = File.Exists(ModPaths.AquaMaiDllInstalledPath);

        if (muModInstalled && !aquaMaiInstalled)
        {
            var cachePath = _muModService.GetResolvedCachePath();
            if (!File.Exists(cachePath))
            {
                // 缓存不存在，下载（DLL 不大，卡一下没事）
                await _muModService.EnsureCache(ct);
            }
            if (!File.Exists(cachePath))
            {
                throw new AquaMaiNotInstalledException();
            }

            return cachePath;
        }

        if (aquaMaiInstalled)
        {
            return ModPaths.AquaMaiDllInstalledPath;
        }

        throw new AquaMaiNotInstalledException();
    }

    public async Task<IConfig> GetCurrentAquaMaiConfig(bool forceDefault = false, bool skipSignatureCheck = false, CancellationToken ct = default)
    {
        var dllPath = await GetAquaMaiDllPath(ct);

        var binary = await File.ReadAllBytesAsync(dllPath, ct);
        if (!skipSignatureCheck)
        {
            var sigResult = AquaMaiSignatureV2.VerifySignature(binary);
            if (sigResult.Status != AquaMaiSignatureV2.VerifyStatus.Valid)
            {
                throw new AquaMaiSignatureVerificationFailedException();
            }
        }
        var configInterface = HeadlessConfigLoader.LoadFromPacked(binary);
        var config = configInterface.CreateConfig();
        CheckConfigApiVersion(configInterface);
        if (File.Exists(ModPaths.AquaMaiConfigPath) && !forceDefault)
        {
            try
            {
                var view = configInterface.CreateConfigView(await File.ReadAllTextAsync(ModPaths.AquaMaiConfigPath, ct));
                var migrationManager = configInterface.GetConfigMigrationManager();

                if (migrationManager.GetVersion(view) != migrationManager.LatestVersion)
                {
                    Console.WriteLine("Migrating AquaMai config from {0} to {1}", migrationManager.GetVersion(view), migrationManager.LatestVersion);
                    view = migrationManager.Migrate(view);
                }

                var parser = configInterface.GetConfigParser();
                parser.Parse(config, view);
            }
            catch (Exception ex)
            {
                Console.WriteLine("无法加载 AquaMai 配置");
                Console.WriteLine(ex);
                if (ex.Message.Contains("Could not migrate the config"))
                {
                    // 这个应该是，AquaMai 未安装或需要更新
                    throw;
                }
                // 这个的提示是 AquaMai 配置文件损坏
                throw new ConfigCorruptedException();
            }
        }

        return config;
    }
}
