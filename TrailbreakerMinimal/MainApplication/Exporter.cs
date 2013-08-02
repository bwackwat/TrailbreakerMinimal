using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Xml;
using TrailbreakerMinimal.MainApplication;

namespace Trailbreaker.MainApplication
{
    /// <summary>
    ///     This class handles all exporting needs, including the translation between UserActions to
    ///     tree nodes, the creation of files, the updating of the tree XML, and the handling of
    ///     tree nodes.
    /// </summary>
    public class Exporter
    {
        //The path to Trailbreaker's output folder. It is in MyDocuments!
        public static string OutputPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "TrailbreakerMinimalOutput");

        private static IEnumerable<string> BuildBlock(List<UserAction> elements, string blockName)
        {
            var lines = new List<string>();

            lines.Add("using Bumblebee.Implementation;");
            lines.Add("using Bumblebee.Interfaces;");
            lines.Add("using Bumblebee.Setup;");
            lines.Add("using OpenQA.Selenium;");
            lines.Add("");
            lines.Add("namespace MBRegressionLibrary");
            lines.Add("{");
            lines.Add("\tpublic class " + blockName + " : Block");
            lines.Add("\t{");
            lines.Add("\t\tpublic " + blockName + "(Session session)");
            lines.Add("\t\t\t: base(session)");
            lines.Add("\t\t{");
            lines.Add("\t\t}");

            foreach (UserAction action in elements)
            {
                lines.AddRange(action.Build(blockName));
            }

            lines.Add("\t}");
            lines.Add("}");

            return lines.ToArray();
        }

        /// <summary>
        ///     This method, for the BlockCreatorGui, creates a miniature tree and fills it with the
        ///     given actions for the block. Then, it builds the tree.
        /// </summary>
        /// <param name="elements">
        ///     The elements of the block.
        /// </param>
        /// <param name="blockName">
        ///     The name of the block.
        /// </param>
        public static void ExportBlock(List<UserAction> elements, string blockName)
        {
            if (elements.Count > 0)
            {
                if (!Directory.Exists(OutputPath))
                {
                    Directory.CreateDirectory(OutputPath);
                }

            string path = Exporter.OutputPath + "\\" + blockName + ".cs";

            FileStream fileStream = File.Create(path);
                StreamWriter writer = new StreamWriter(fileStream);

                IEnumerable<string> build = BuildBlock(elements, blockName);

                foreach (string s in build)
                {
                    writer.WriteLine(s);
                }

                writer.Close();
                fileStream.Close();

                    ProcessStartInfo pi = new ProcessStartInfo(path);
                    pi.Arguments = Path.GetFileName(path);
                    pi.UseShellExecute = true;
                    pi.WorkingDirectory = Path.GetDirectoryName(path);
                    pi.FileName = "C:\\Windows\\notepad.exe";
                    pi.Verb = "OPEN";
                    Process.Start(pi);
            }
        }
    }
}