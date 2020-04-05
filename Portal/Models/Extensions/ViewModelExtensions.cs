using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Portal.Data.Models;

namespace Portal.Models.Extensions
{
    public static class ViewModelExtensions
    {
        public static ProjectMessage ToMessageDbModel(this SaveMessageViewModel model)
        {
            return  new ProjectMessage()
            {
                Id = model.Id,
                ProjectID = model.ProjectID,
                From = model.From,
                Message = model.Message,
                SendDate = model.SendDate,
                To = model.To,
                Type = model.Type
            };
        }

        public static SaveMessageViewModel ToMessageViewModel(this Message db)
        {
            return new SaveMessageViewModel()
            {
                Id = db.MessageID,
                ProjectID = db.ProjectID,
                From = db.EmailFrom,
                Message = db.EmailBody,
                SendDate = db.DateRec,
                To = db.EmailTo,
                Type = db.Type,
                parentId = db.ReplyMessageID,
                DocumentDb = db.DocumentDb,
                itemNo = db.ItemNo,
                initial = db.Initial,
                isRead = db.IsRead,
                actionType = db.ActionType,
                dueDate = db.DueDate
            };
        }
    }
}
