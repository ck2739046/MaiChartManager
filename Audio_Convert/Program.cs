using System;
using System.IO;
using System.Reflection;
using NAudio.Wave;
using VGAudio;
using VGAudio.Cli;
using Xv2CoreLib.ACB;

namespace AudioConverter
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            // Write embedded AcbFormatHelper.xml to disk temporarily so Xv2CoreLib can load it by path.
            string exeDir = AppContext.BaseDirectory;
            string helperPath = Path.Combine(exeDir, "AcbFormatHelper.xml");
            bool helperCreated = false;

            try
            {
                // Read embedded resource and write to disk
                if (File.Exists(helperPath)) File.Delete(helperPath);
                var assembly = Assembly.GetExecutingAssembly();
                using var s = assembly.GetManifestResourceStream("AudioConverter.Resources.AcbFormatHelper.xml");
                if (s != null)
                {
                    using var fs = new FileStream(helperPath, FileMode.Create, FileAccess.Write);
                    s.CopyTo(fs);
                    helperCreated = true;
                }
                

                if (args.Length == 0)
                {
                    Console.WriteLine("音频转换器 - 将音频文件转换为ACB/AWB格式");
                    Console.WriteLine("使用方法:");
                    Console.WriteLine("  1. 将音频文件拖拽到此程序图标上");
                    Console.WriteLine("  2. 或者通过命令行: AudioConverter.exe <音频文件路径>");
                    Console.WriteLine("");
                    Console.WriteLine("支持格式: MP3, OGG, WAV, WMA, AAC, MP4");
                    Console.WriteLine("输出文件: 在输入文件相同目录生成 .acb 和 .awb 文件");
                    Console.WriteLine("");
                    Console.WriteLine("按任意键退出...");
                    Console.ReadKey();
                    return;
                }

                string inputPath = args[0];

                if (!File.Exists(inputPath))
                {
                    Console.WriteLine($"错误: 文件不存在 - {inputPath}");
                    return;
                }

                string tempAudioFile = null;
                try
                {
                    // 如果是MP4文件，先提取音轨
                    if (Path.GetExtension(inputPath).Equals(".mp4", StringComparison.OrdinalIgnoreCase))
                    {
                        Console.WriteLine("检测到MP4视频文件，正在提取音频轨道...");
                        string fileNameWithoutExt1 = Path.GetFileNameWithoutExtension(inputPath);
                        tempAudioFile = Path.Combine(exeDir, fileNameWithoutExt1 + "_temp.wav");
                        
                        Audio.ExtractAudioFromMp4(inputPath, tempAudioFile);
                        Console.WriteLine("音频轨道提取完成");
                        
                        // 使用临时音频文件作为输入
                        inputPath = tempAudioFile;
                    }

                    Console.WriteLine($"正在转换: {Path.GetFileName(inputPath)}");

                    // 生成输出路径
                    string directory = Path.GetDirectoryName(args[0]); // 使用原始输入路径的目录
                    string fileNameWithoutExt = Path.GetFileNameWithoutExtension(args[0]); // 使用原始文件名
                    string acbPath = Path.Combine(directory, fileNameWithoutExt + ".acb");
                    string awbPath = Path.Combine(directory, fileNameWithoutExt + ".awb");

                    // 执行转换
                    Audio.ConvertToMai(inputPath, acbPath);

                    Console.WriteLine($"转换完成!");
                    Console.WriteLine($"ACB文件: {acbPath}");
                    Console.WriteLine($"AWB文件: {awbPath}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"转换失败: {ex.Message}");
                    Console.WriteLine($"详细错误: {ex}");
                }
                finally
                {
                    // 删除临时音频文件
                    if (tempAudioFile != null && File.Exists(tempAudioFile))
                    {
                        try
                        {
                            File.Delete(tempAudioFile);
                            Console.WriteLine("已清理临时文件");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"警告: 无法删除临时文件 {tempAudioFile}: {ex.Message}");
                        }
                    }
                }
            }
            finally
            {
                // Remove the helper file if we created it
                try
                {
                    if (helperCreated && File.Exists(helperPath)) File.Delete(helperPath);
                }
                catch { /* ignore cleanup errors */ }
            }
        }
    }

    public static class Audio
    {
        /// <summary>
        /// 从MP4视频文件中提取音频轨道并保存为WAV文件
        /// </summary>
        /// <param name="mp4Path">MP4视频文件路径</param>
        /// <param name="outputWavPath">输出的WAV文件路径</param>
        public static void ExtractAudioFromMp4(string mp4Path, string outputWavPath)
        {
            using (var reader = new MediaFoundationReader(mp4Path))
            {
                // MediaFoundationReader 会自动解码视频中的音频流（如AAC）为PCM
                WaveFileWriter.CreateWaveFile(outputWavPath, reader);
            }
        }

        public static void ConvertToMai(string srcPath, string savePath, float padding = 0, Stream src = null, string previewFilename = null, Stream preview = null)
        {
            var acbBytes = ReadResourceFile("AudioConverter.Resources.nopreview.acb");
            var wrapper = new ACB_Wrapper(ACB_File.Load(acbBytes, null));
            var trackBytes = LoadAndConvertFile(srcPath, FileType.Hca, false, 9170825592834449000, padding, src);

            wrapper.Cues[0].AddTrackToCue(trackBytes, true, false, EncodeType.HCA);
            if (previewFilename is not null)
            {
                var previewTrackBytes = LoadAndConvertFile(previewFilename, FileType.Hca, true, 9170825592834449000, 0, preview);
                wrapper.Cues[1].AddTrackToCue(previewTrackBytes, true, false, EncodeType.HCA);
            }

            wrapper.AcbFile.Save(savePath);
        }

        private static byte[] ReadResourceFile(string filename)
        {
            using var s = Assembly.GetExecutingAssembly().GetManifestResourceStream(filename);
            var buffer = new byte[1024];
            using var ms = new MemoryStream();
            while (true)
            {
                var read = s.Read(buffer, 0, buffer.Length);
                if (read <= 0)
                    return ms.ToArray();
                ms.Write(buffer, 0, read);
            }
        }

        // 不要 byte[] 转 memory stream 倒来倒去，直接传入 stream
        public static byte[] LoadAndConvertFile(string path, FileType convertToType, bool loop, ulong encrpytionKey = 0, float padding = 0, Stream src = null)
        {
            using var read = src ?? File.OpenRead(path);
            switch (Path.GetExtension(path).ToLowerInvariant())
            {
                case ".wav":
                case ".mp3":
                case ".ogg":
                case ".wma":
                case ".aac":
                    return ConvertFile(ConvertToWav(read, Path.GetExtension(path).Equals(".ogg", StringComparison.InvariantCultureIgnoreCase), padding), FileType.Wave, convertToType, loop, encrpytionKey);
                case ".hca":
                    return ConvertFile(read, FileType.Hca, convertToType, loop, encrpytionKey);
                case ".adx":
                    if (convertToType == FileType.Adx)
                    {
                        var ms = new MemoryStream();
                        read.CopyTo(ms);
                        return ms.ToArray();
                    }

                    return ConvertFile(read, FileType.Adx, convertToType, loop, encrpytionKey);
                case ".at9":
                    return ConvertFile(read, FileType.Atrac9, convertToType, loop, encrpytionKey);
                case ".dsp":
                    return ConvertFile(read, FileType.Dsp, convertToType, loop, encrpytionKey);
                case ".bcwav":
                    return ConvertFile(read, FileType.Bcwav, convertToType, loop, encrpytionKey);
            }

            throw new InvalidDataException($"Filetype of \"{path}\" is not supported.");
        }

        public static Stream ConvertToWav(Stream src, bool isOgg, float padding = 0)
        {
            using WaveStream reader = isOgg ? new NAudio.Vorbis.VorbisWaveReader(src, true) : new StreamMediaFoundationReader(src);
            var sample = reader.ToSampleProvider();

            switch (padding)
            {
                case > 0:
                {
                    var sp = new SilenceProvider(reader.WaveFormat);
                    var silence = sp.ToSampleProvider().Take(TimeSpan.FromSeconds(padding));
                    sample = silence.FollowedBy(sample);
                    break;
                }
                case < 0:
                    sample = sample.Skip(TimeSpan.FromSeconds(-padding));
                    break;
            }

            var stream = new MemoryStream();
            WaveFileWriter.WriteWavFileToStream(stream, sample.ToWaveProvider16()); // 淦
            stream.Position = 0; // 淦 x2
            return stream;
        }

        public static byte[] ConvertFile(Stream s, FileType encodeType, FileType convertToType, bool loop,
            ulong encryptionKey = 0)
        {
            ConvertStatics.SetLoop(loop, 0, 0);

            var options = new Options
            {
                KeyCode = encryptionKey,
                Loop = loop
            };

            if (options.Loop)
                options.LoopEnd = int.MaxValue;

            byte[] track = ConvertStream.ConvertFile(options, s, encodeType, convertToType);

            //if (convertToType == FileType.Hca && loop)
            //    track = HCA.EncodeLoop(track, loop);

            return track;
        }

        private static FileType GetFileType(EncodeType encodeType)
        {
            switch (encodeType)
            {
                case EncodeType.HCA:
                case EncodeType.HCA_ALT:
                    return FileType.Hca;
                case EncodeType.ADX:
                    return FileType.Adx;
                case EncodeType.ATRAC9:
                    return FileType.Atrac9;
                case EncodeType.DSP:
                    return FileType.Dsp;
                case EncodeType.BCWAV:
                    return FileType.Bcwav;
                default:
                    return FileType.NotSet;
            }
        }

        public static byte[] AcbToWav(string acbPath)
        {
            var acb = ACB_File.Load(acbPath);
            var wave = acb.GetWaveformsFromCue(acb.Cues[0])[0];
            var entry = acb.GetAfs2Entry(wave.AwbId);
            using MemoryStream stream = new MemoryStream(entry.bytes);
            return ConvertStream.ConvertFile(new Options(), stream, GetFileType(wave.EncodeType), FileType.Wave);
        }
    }
}