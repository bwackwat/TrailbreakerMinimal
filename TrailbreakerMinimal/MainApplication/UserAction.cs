using System.Collections.Generic;
using System.Runtime.Serialization;

namespace TrailbreakerMinimal.MainApplication
{
    /// <summary>
    ///     This class represents a click by a user on an element of a web page. It essentially
    ///     contains a good deal of metadata regarding the clicked element. Most of the class is
    ///     defined by serializable elements, but some of the data is altered as other information
    ///     is determined or found regarding the action's element.
    /// </summary>
    [DataContract]
    public class UserAction
    {
        public string Label;
        public bool IsEnumerable = false;

        [DataMember(Name = "Id", IsRequired = true)]
        public string Id { get; set; }

        [DataMember(Name = "Name", IsRequired = true)]
        public string Name { get; set; }

        [DataMember(Name = "ClassName", IsRequired = true)]
        public string ClassName { get; set; }

        [DataMember(Name = "Type", IsRequired = true)]
        public string Type { get; set; }

        [DataMember(Name = "Node", IsRequired = true)]
        public string Node { get; set; }

        /// <summary>
        ///     A method to get the best Label for a user's action (uses the most valuable metadata).
        /// </summary>
        /// <returns>
        ///     A string to be the label of this UserAction.
        /// </returns>
        public string GetBestLabel()
        {
            if (Id != "null")
            {
                return Id;
            }
            else if (Name != "null")
            {
                return Name;
            }
            else if (ClassName != "null")
            {
                return ClassName;
            }
            else
            {
                return Node + "/" + Type;
            }
        }

        /// <summary>
        ///     A method to find the best Selenium By selector for this action.
        /// </summary>
        /// <returns>
        ///     A string for the selector.
        /// </returns>
        public string GetBestSelector()
        {
            string by;
            if (Id != "null")
            {
                by = "By.Id(\"" + Id + "\")";
            }
            else if (Name != "null")
            {
                by = "By.Name(\"" + Name + "\")";
            }
            else if (ClassName != "null")
            {
                by = "By.ClassName(\"" + ClassName + "\")";
            }
            else
            {
                by = "NO GOOD SELECTOR!";
            }
            return by;
        }

        public string GetWebElementClass()
        {
            if (Node.ToLower() == "select")
            {
                return "SelectBox";
            }
            else if (Node.ToLower() == "input" && Type.ToLower() == "checkbox")
            {
                return "Checkbox";
            }
            else if (Node.ToLower() == "input" && Type.ToLower() == "radio")
            {
                return "RadioButtons";
            }
            else if (Node.ToLower() == "input" && Type.ToLower() != "button" && Type.ToLower() != "submit")
            {
                return "TextField";
            }
            else
            {
                return "Clickable";
            }
        }

        public IEnumerable<string> Build(string blockName)
        {
            var lines = new List<string>();

            string webElementClass = GetWebElementClass();
            string selector = GetBestSelector();

            lines.Add("");

            if (IsEnumerable)
            {
                lines.Add("\t\tpublic IEnumerable<I" + webElementClass + "<" + blockName + ">> " + Label);
                lines.Add("\t\t{");
                lines.Add("\t\t\tget");
                lines.Add("\t\t\t{");
                lines.Add("\t\t\t\treturn GetElements(" + selector + ").Select(e => new " + webElementClass + "<" + blockName +
                          ">(this, e));");
                lines.Add("\t\t\t}");
            }
            else
            {
                lines.Add("\t\tpublic I" + webElementClass + "<" + blockName + "> " + Label);
                lines.Add("\t\t{");
                lines.Add("\t\t\tget { return new " + webElementClass + "<" + blockName + ">(this, " + selector + "); }");
            }

            lines.Add("\t\t}");

            return lines.ToArray();
        }
    }
}