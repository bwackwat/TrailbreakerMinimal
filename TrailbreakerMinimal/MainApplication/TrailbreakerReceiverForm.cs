using System.Collections.Generic;
using System.Windows.Forms;
using TrailbreakerMinimal.MainApplication;

namespace Trailbreaker.MainApplication
{
    /// <summary>
    ///     This is an awesome abstract class for forms which can receive user actions and
    ///     characters from a receiver. Incomplete (research into which elements can be shared
    ///     is being held).
    /// </summary>
    public abstract class TrailbreakerReceiverForm : Form
    {
        internal readonly List<UserAction> Elements = new List<UserAction>();
        public abstract void AddAction(UserAction userAction);
        public abstract void AddCharacter(char c);

        /// <summary>
        ///     Checks if an action exists in the set of elements.
        /// </summary>
        /// <param name="action">
        ///     Given action to check.
        /// </param>
        /// <returns>
        ///     True if the element is in the list.
        /// </returns>
        internal bool ActionExists(UserAction action)
        {
            foreach (UserAction userAction in Elements)
            {
                if (userAction.Id == action.Id && userAction.Name == action.Name &&
                    userAction.ClassName == action.ClassName && userAction.Type == action.Type)
                {
                    return true;
                }
            }
            return false;
        }
    }
}