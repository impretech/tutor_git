using System;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Portal.Data.Models;
using Portal.Models;

namespace Portal.Data
{
    public partial class SyvennDBContext : DbContext
    {
        public SyvennDBContext()
        {
        }

        public SyvennDBContext(DbContextOptions<SyvennDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<MessageType> MessageTypes { get; set; }
        public virtual DbSet<ProjectMessage> ProjectMessages { get; set; }
        public virtual DbSet<PCCSummary> PCCSummary { get; set; }

        public virtual DbSet<Project> Project { get; set; }
        public virtual DbSet<ProjectSkillset> ProjectSkillsets { get; set; }
        public virtual DbSet<AlertDetail> Alerts { get; set; }

        public virtual DbSet<Note> Notes { get; set; }

        public virtual DbSet<Contact> Contacts { get; set; }

        public virtual DbSet<ContactLink> ContactLinks { get; set; }

        public virtual DbSet<Email> Emails { get; set; }

        public virtual DbSet<Location> Locations { get; set; }

        public virtual DbSet<ActivityLog> ActivityLogs { get; set; }

        public virtual DbSet<ProjectTeam> ProjectTeams { get; set; }

        public virtual DbSet<Phone> Phones { get; set; }

        public virtual DbSet<ProjectTeamDetail> ProjectTeamDetails { get; set; }

        public virtual DbSet<Vendor> Vendors { get; set; }

        public virtual DbSet<VendorLink> VendorLinks { get; set; }

        public virtual DbSet<DocumentDb> DocumentDbs { get; set; }

        public virtual DbSet<DocFile> DocFiles { get; set; }

        public virtual DbSet<Message> Messages { get; set; }

        public virtual DbSet<Lookup> Lookups { get; set; }

        public virtual DbSet<Task> Tasks { get; set; }

        public virtual DbSet<Link> Links { get; set; }

        public virtual DbSet<VendorLookup> VendorLookups { get; set; }

        public virtual DbSet<Budget> Budgets { get; set; }

        public virtual DbSet<BudgetCategory> BudgetCategories { get; set; }

        public virtual DbSet<BudgetDetail> BudgetDetails { get; set; }

        public virtual DbSet<BudgetDefault> BudgetDefaults { get; set; }

        public virtual DbSet<Deposit> Deposits { get; set; }

        public virtual DbSet<DepositCategory> DepositCategories { get; set; }

        public virtual DbSet<DepositCatSum> DepositCatSums { get; set; }

        public virtual DbSet<DepositDetail> DepositDetails { get; set; }

        public virtual DbSet<DepsoitDetLineSum> DepsoitDetLineSums { get; set; }

        public virtual DbSet<VendorContact> VendorContacts { get; set; }

        public virtual DbSet<EntContact> EntCodeContacts { get; set; }

        //  public virtual DbSet<ContractViewModel> ContractViews { get; set; }

        public virtual DbSet<ContactRole> ContactRoles { get; set; }

        public virtual DbSet<RFI> RFIs { get; set; }

        public virtual DbSet<RFIResponse> RFIResponses { get; set; }

        public virtual DbSet<RFILookup> RFILookups { get; set; }

        public virtual DbSet<Submittal> Submittals { get; set; }

        public virtual DbSet<SubmittalDocLink> SubmittalDocLinks { get; set; }

        public virtual DbSet<RFIDocLink> RFIDocLinks { get; set; }

        public virtual DbSet<DistributionLog> DistributionLogs { get; set; }

        public virtual DbSet<DocumentLink> DocumentLinks { get; set; }

        public virtual DbSet<EmailLookup> EmailLookups { get; set; }

        public virtual DbSet<LocationLink> LocationLinks { get; set; }

        public virtual DbSet<Contributor> Contributors { get; set; }

        public virtual DbSet<Quote> Quotes { get; set; }

        public virtual DbSet<QuoteAddendum> QuoteAddendums { get; set; }

        public virtual DbSet<QuoteBid> QuoteBids { get; set; }

        public virtual DbSet<QuoteBidAlt> QuoteBidAlts { get; set; }

        public virtual DbSet<QuoteBidAddendum> QuoteBidAddendums { get; set; }

        public virtual DbSet<QuoteLookup> QuoteLookups { get; set; }

        public virtual DbSet<Contract> Contracts { get; set; }

        public virtual DbSet<DepositView> DepositViews { get; set; }

        public virtual DbSet<UserContact> UserContacts { get; set; }

        public virtual DbSet<POLine> POLines { get; set; }

        public virtual DbSet<LineCode> LineCodes { get; set; }

        public virtual DbSet<PO> POs { get; set; }

        public virtual DbSet<QuoteAward> QuoteAwards {get; set;}

        public virtual DbSet<Schedule> Schedules { get; set; }

        public virtual DbSet<CRM_Import> CRM_Imports { get; set; }

        public virtual DbSet<ChangeOrder> COs { get; set; }

        public virtual DbSet<Skillset> Skillsets { get; set; }

        public virtual DbSet<ProjectMgr> ProjectMgrs { get; set; }

        public virtual DbSet<PMSkillset> PMSkillSets { get; set; }

        public virtual DbSet<Invoice> Invoices { get; set; }

        public virtual DbSet<InvLine> InvoiceLines { get; set; }

        public virtual DbSet<vwPOVendor> vwPOVendors { get; set; }

        public virtual DbSet<POGroup> POGroups { get; set; }

        public virtual DbSet<MilestoneDefault> MilestoneDefaults { get; set; }

        public virtual DbSet<MilestoneTask> MilestoneTasks { get; set; }

        public virtual DbSet<ProjectMilestone> ProjectMilestones { get; set; }

        public virtual DbSet<ShipTracking> ShipTrackings { get; set; }

        public virtual DbSet<FieldReport> FieldReports { get; set; }

        public virtual DbSet<FRImage> FRImages { get; set; }

        public virtual DbSet<HeatMapLayer> HeatMapLayers { get; set; }

        public virtual DbSet<HeatMapData> HeatMapDatas { get; set; }

        public virtual DbSet<ProjectLocationLookup> ProjectLocations { get; set; }

        public static string ConnectionString { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(ConnectionString);
                optionsBuilder.EnableSensitiveDataLogging(true);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PCCSummary>(entity =>
            {
                entity.ToTable("vwPCCSummary", "dbo");

                entity.Property(e => e.ProjectId).HasColumnName("ProjectID");

                //entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.AlertBudget).HasColumnName("AlertBudget");

                entity.Property(e => e.AlertBuyout).HasColumnName("AlertBuyout");

                entity.Property(e => e.AlertDocuments).HasColumnName("AlertDocument");

                entity.Property(e => e.AlertMilestone).HasColumnName("AlertMilestone");

                //entity.Property(e => e.AlertDate).HasColumnName("Alert_Date").HasColumnType("date");

                //entity.Property(e => e.AlertDescription).HasColumnName("Alert_Description");

                entity.Property(e => e.Description)
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.DocCo).HasColumnName("DocCO");

                entity.Property(e => e.DocRfi).HasColumnName("DocRFI");

                //entity.Property(e => e.EndDate).HasColumnType("date");

                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.OwnerEmail)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Phase)
                    .IsRequired()
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectNo)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Resp)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                //entity.Property(e => e.StartDate).HasColumnType("date");

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.Property(e => e.ProjectId).HasColumnName("ProjectID");

                entity.Property(e => e.ProjectNo)
                   .IsRequired()
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.Title)
                   .IsRequired()
                   .HasMaxLength(100)
                   .IsUnicode(false);

                entity.Property(e => e.Description)
                  .HasMaxLength(1000)
                  .IsUnicode(false);

                entity.Property(e => e.Site)
                  .HasMaxLength(10)
                  .IsUnicode(false);

                entity.Property(e => e.CapitalNo)
                  .HasMaxLength(50)
                  .IsUnicode(false);

                entity.Property(e => e.CustID)
                  .HasMaxLength(50)
                  .IsUnicode(false);

                entity.Property(e => e.DateReceived).HasColumnType("date");

                entity.Property(e => e.Phase)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.FY)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.TypeArea)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.TypeConstruction)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.SmartID)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.SmartLinkRead)
                .HasMaxLength(200)
                .IsUnicode(false);

                entity.Property(e => e.SmartLinkEdit)
                .HasMaxLength(200)
                .IsUnicode(false);

                entity.Property(e => e.Requestor)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.ImpactItem)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.ImpactDate).HasColumnType("date");

                entity.Property(e => e.Gsf);

                entity.Property(e => e.CreatedBy)
               .HasMaxLength(50)
               .IsUnicode(false);

                entity.Property(e => e.EntCode)
               .HasMaxLength(25)
               .IsUnicode(false);

                entity.Property(e => e.OwnerEmail)
               .HasMaxLength(100)
               .IsUnicode(false);

                entity.Property(e => e.Client)
              .HasMaxLength(50)
              .IsUnicode(false);

                entity.Property(e => e.OppID)
               .HasMaxLength(50)
               .IsUnicode(false);

                entity.Property(e => e.PMId).HasColumnName("PMId");
                entity.Property(e => e.Holder).HasColumnName("Holder");
                entity.Property(e => e.StartDate).HasColumnType("date");
                entity.Property(e => e.Duration);
                entity.Property(e => e.Value);
                entity.Property(e => e.PMonSite);

            });

            modelBuilder.Entity<AlertDetail>().ToTable("Alert");
            modelBuilder.Entity<AlertDetail>(entity =>
            {
                entity.Property(e => e.AlertId).HasColumnName("AlertId").IsRequired();
                entity.Property(e => e.Date).HasColumnName("Date").HasColumnType("date");

                entity.Property(e => e.AlertType)
                 .IsRequired()
                 .HasMaxLength(20)
                 .IsUnicode(false);

                entity.Property(e => e.Stage)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.NodeId)
                .HasMaxLength(100)
                .IsUnicode(false);

                entity.Property(e => e.NodeDescription)
                .HasMaxLength(250)
                .IsUnicode(false);

                entity.Property(e => e.Condition)
                .HasMaxLength(50)
                .IsUnicode(false);

                entity.Property(e => e.Recommendation)
                .HasMaxLength(250)
                .IsUnicode(false);

                entity.Property(e => e.ProjectId).HasColumnName("ProjectID")
                .IsRequired();

            });

            modelBuilder.Entity<Note>().ToTable("Note");
            modelBuilder.Entity<Note>(entity =>
            {
                entity.Property(e => e.NoteID).HasColumnName("NoteID");

                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");

                entity.Property(e => e.Writer)
                 .HasMaxLength(50)
                 .IsRequired()
                 .IsUnicode(false);

                entity.Property(e => e.Created).HasColumnName("Created").HasColumnType("date");

                entity.Property(e => e.ProgressNote).HasColumnName("Note")
                .IsRequired()
                .HasMaxLength(1000)
                .IsUnicode(false);

                entity.Property(e => e.ItemType).HasColumnName("ItemType")
                .HasMaxLength(25)
                .IsUnicode(false);

                entity.Property(e => e.ItemNo);

            });

            modelBuilder.Entity<Contact>().ToTable("Contact");
            modelBuilder.Entity<Contact>(entity =>
            {
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.FirstName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.LastName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.JobTitle).HasColumnName("Title")
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Company)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Username)
                    .HasMaxLength(20)
                    .IsUnicode(false);
                entity.Property(e => e.Dept)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Prefix)
                    .HasMaxLength(10)
                    .IsUnicode(false);
                entity.Property(e => e.Suffix)
                    .HasMaxLength(20)
                    .IsUnicode(false);
                entity.Property(e => e.DOB).HasColumnType("date");
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.MiddleName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.PreferredName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.ShowAsName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.Note)
                   .HasMaxLength(1000)
                   .IsUnicode(false);
                entity.Property(e => e.URL)
                   .HasMaxLength(200)
                   .IsUnicode(false);
                entity.Property(e => e.VendorID).HasColumnName("VendorID");

            });

            modelBuilder.Entity<ContactLink>().ToTable("ContactLink");
            modelBuilder.Entity<ContactLink>(entity =>
            {
                entity.Property(e => e.ContactID).HasColumnName("ContactLinkID");
                entity.Property(e => e.Label)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.ItemType)
                .HasMaxLength(20)
                .IsUnicode(false);
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
            });

            modelBuilder.Entity<Email>().ToTable("Email");
            modelBuilder.Entity<Email>(entity =>
            {
                entity.Property(e => e.EmailID).HasColumnName("EmailID");
                entity.Property(e => e.Label)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.EmailAddress)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.isPrimary);
            });

            modelBuilder.Entity<Location>().ToTable("Location");
            modelBuilder.Entity<Location>(entity =>
            {
                entity.Property(e => e.LocationID).HasColumnName("LocationID");
                entity.Property(e => e.Bldg)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Floor)
                 .HasMaxLength(10)
                 .IsUnicode(false);
                entity.Property(e => e.Room)
                 .HasMaxLength(10)
                 .IsUnicode(false);
                entity.Property(e => e.Address1)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Address2)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.AddCity)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.AddState)
                 .HasMaxLength(2)
                 .IsUnicode(false);
                entity.Property(e => e.AddZip)
                 .HasMaxLength(15)
                 .IsUnicode(false);
                entity.Property(e => e.AddActive);
                entity.Property(e => e.isPrimary);
                entity.Property(e => e.Label)
               .HasMaxLength(20)
               .IsUnicode(false);
                entity.Property(e => e.Longitude);
                entity.Property(e => e.Latitude);
            });

            modelBuilder.Entity<ActivityLog>().ToTable("ActivityLog");
            modelBuilder.Entity<ActivityLog>(entity =>
            {
                entity.Property(e => e.ActivityLogID).HasColumnName("ActivityLogID");
                entity.Property(e => e.LogDate).HasColumnType("date");
                entity.Property(e => e.LogUser)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.Change)
                   .HasMaxLength(2000)
                   .IsUnicode(false);
                entity.Property(e => e.ItemType)
                   .HasMaxLength(20)
                   .IsUnicode(false);
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.EntCode)
                  .HasMaxLength(200)
                  .IsUnicode(false);
            });

            modelBuilder.Entity<ProjectTeam>().ToTable("ProjectTeam");
            modelBuilder.Entity<ProjectTeam>(entity =>
            {
                entity.Property(e => e.ProjectTeamID).HasColumnName("ProjectTeamID");
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Role)
                   .HasMaxLength(20)
                   .IsUnicode(false);
                entity.Property(e => e.EntCode)
                   .HasMaxLength(250)
                   .IsUnicode(false);
            });

            modelBuilder.Entity<Phone>().ToTable("Phone");
            modelBuilder.Entity<Phone>(entity =>
            {
                entity.Property(e => e.PhoneID).HasColumnName("PhoneID");
                entity.Property(e => e.Label)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.PhoneNumber)
                 .HasMaxLength(25)
                 .IsUnicode(false);
                entity.Property(e => e.isPrimary);
            });

            modelBuilder.Entity<ProjectTeamDetail>().ToTable("vwProjectTeam");
            modelBuilder.Entity<ProjectTeamDetail>(entity =>
            {
                entity.Property(e => e.ProjectTeamID).HasColumnName("ProjectTeamID");
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Role)
                   .HasMaxLength(20)
                   .IsUnicode(false);
                entity.Property(e => e.EntCode)
                   .HasMaxLength(250)
                   .IsUnicode(false);
                entity.Property(e => e.FirstName)
                .HasMaxLength(20)
                .IsUnicode(false);
                entity.Property(e => e.LastName)
                .HasMaxLength(30)
                .IsUnicode(false);
                entity.Property(e => e.Title)
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.Company)
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.EmailAddress)
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.PhoneNumber)
                .HasMaxLength(25)
                .IsUnicode(false);
                entity.Property(e => e.EmailID).HasColumnName("EmailID");
                entity.Property(e => e.PhoneID).HasColumnName("PhoneID");
            });

            modelBuilder.Entity<Vendor>().ToTable("Vendor");
            modelBuilder.Entity<Vendor>(entity =>
            {
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.VendorName)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Domain)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.License)
                 .HasMaxLength(25)
                 .IsUnicode(false);
                entity.Property(e => e.BusinessType)
                 .HasMaxLength(25)
                 .IsUnicode(false);
                entity.Property(e => e.isUnion);
                entity.Property(e => e.Status)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.isMBE);
                entity.Property(e => e.isWBE);
                entity.Property(e => e.isSBE);
                entity.Property(e => e.isVA);
                entity.Property(e => e.COI)
                 .HasMaxLength(20)
                 .IsUnicode(false);
                entity.Property(e => e.COIExp).HasColumnType("date");
                entity.Property(e => e.WorkType)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.W9)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.ClassStatus)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.ClassExp).HasColumnType("date");
                entity.Property(e => e.EntCode)
                .HasMaxLength(25)
                .IsUnicode(false);
                entity.Property(e => e.Note)
               .HasMaxLength(1000)
               .IsUnicode(false);
            });

            modelBuilder.Entity<VendorLink>().ToTable("VendorLink");
            modelBuilder.Entity<VendorLink>(entity =>
            {
                entity.Property(e => e.VendorLinkID).HasColumnName("VendorLinkID");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.ItemType)
                 .HasMaxLength(20)
                 .IsUnicode(false);
                entity.Property(e => e.ItemType)
                .HasMaxLength(25)
                .IsUnicode(false);
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.EntCode)
                  .HasMaxLength(250)
                  .IsUnicode(false);
            });

            modelBuilder.Entity<DocumentDb>().ToTable("Document");
            modelBuilder.Entity<DocumentDb>(entity =>
            {
                entity.Property(e => e.DocID).HasColumnName("DocID");
                entity.Property(e => e.Name)
                    .HasMaxLength(250)
                    .IsUnicode(false);
                entity.Property(e => e.Type)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Created).HasColumnType("date");
                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ItemType)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.ItemNo).HasColumnName("ItemNo");
                entity.Property(e => e.FileLength);
            });

            modelBuilder.Entity<DocFile>().ToTable("DocFile");
            modelBuilder.Entity<DocFile>(entity =>
            {
                entity.Property(e => e.DocID).HasColumnName("DocID");
                entity.Property(e => e.FileData).HasColumnName("FileData");

            });

            modelBuilder.Entity<Message>().ToTable("Message");
            modelBuilder.Entity<Message>(entity =>
            {
                entity.Property(e => e.MessageID).HasColumnName("MessageID");
                entity.Property(e => e.EmailFrom)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.EmailTo)
                    .HasMaxLength(200)
                    .IsUnicode(false);
                entity.Property(e => e.EmailCC)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.EmailBcc)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.DateRec).HasColumnType("datetime2");
                entity.Property(e => e.EmailBody)
                    .IsUnicode(false);
                entity.Property(e => e.EmailSubject)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.UserID)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.IsDismissed).HasColumnType("bool");
                entity.Property(e => e.ProjectID);
                entity.Property(e => e.ItemType)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ItemNo);
                entity.Property(e => e.OnSched).HasColumnType("bool");
                entity.Property(e => e.Status)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.Type)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.DueDate).HasColumnType("datetime2");
                entity.Property(e => e.FromCompany)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.ToCompany)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.ReplyMessageID).HasColumnName("ReplyMessageID");
                entity.Property(e => e.SchedID).HasColumnName("SchedID");
                entity.Property(e => e.IsRead).HasColumnType("bool");
                entity.Property(e => e.ActionType)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Lookup>().ToTable("Lookup");
            modelBuilder.Entity<Lookup>(entity =>
            {
                entity.Property(e => e.LookupID).HasColumnName("LookupID");
                entity.Property(e => e.Module)
                   .HasMaxLength(10)
                   .IsUnicode(false);
                entity.Property(e => e.EntCode)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.Prompt)
                   .HasMaxLength(20)
                   .IsUnicode(false);
                entity.Property(e => e.Value)
                   .HasMaxLength(25)
                   .IsUnicode(false);
            });


            modelBuilder.Entity<Task>().ToTable("Gantt_Task");
            modelBuilder.Entity<Task>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.Text)
                 .HasMaxLength(255)
                 .IsUnicode(false);
                entity.Property(e => e.StartDate).HasColumnType("date");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Duration).HasColumnType("int");
                entity.Property(e => e.SortOrder).HasColumnType("int");
                entity.Property(e => e.ParentId).HasColumnName("ParentId");
                entity.Property(e => e.Type)
                   .HasMaxLength(20)
                   .IsUnicode(false);
                entity.Property(e => e.Readonly).HasColumnType("bool");
                entity.Property(e => e.Editable).HasColumnType("bool");
                entity.Property(e => e.Duration).HasColumnType("int");
                entity.Property(e => e.Progress).HasColumnType("float");
                entity.Property(e => e.WT).HasColumnType("int");
            });

            modelBuilder.Entity<Link>().ToTable("Gantt_Link");
            modelBuilder.Entity<Link>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.SourceTaskId).HasColumnName("SourceTaskId");
                entity.Property(e => e.TargetTaskId).HasColumnName("TargetTaskId");
                entity.Property(e => e.Type)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Lag).HasColumnType("int");
                entity.Property(e => e.Readonly).HasColumnType("bool");
                entity.Property(e => e.Editable).HasColumnType("bool");
            });

            modelBuilder.Entity<VendorLookup>().ToTable("VendorPrimaries");
            modelBuilder.Entity<VendorLookup>(entity =>
            {
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.VendorName)
                .HasMaxLength(250)
                .IsUnicode(false);
                entity.Property(e => e.PhoneID).HasColumnName("PhoneID");
                entity.Property(e => e.PhoneNumber)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.LocationID).HasColumnName("LocationID");
                entity.Property(e => e.LocationLabel)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.Address1)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.Address2)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.AddCity)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.AddState)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.AddZip)
                .HasMaxLength(50)
                .IsUnicode(false);
            });

            modelBuilder.Entity<Budget>().ToTable("Budget");
            modelBuilder.Entity<Budget>(entity =>
            {
                entity.Property(e => e.BudgetID).HasColumnName("BudgetID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.AccountNo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Status)
                      .HasMaxLength(50)
                      .IsUnicode(false);
                entity.Property(e => e.BudgetType).HasColumnName("Type")
                      .HasMaxLength(50)
                      .IsUnicode(false);
                entity.Property(e => e.Gsf);
                entity.Property(e => e.DateEntered).HasColumnType("date");
                entity.Property(e => e.DatePublished).HasColumnType("date");
                entity.Property(e => e.DueDate).HasColumnName("BudDueDate").HasColumnType("date");
                entity.Property(e => e.ProjectDate).HasColumnName("ProjectDate").HasColumnType("date");
                entity.Property(e => e.AddendumNo);
                entity.Property(e => e.Writer)
                     .HasMaxLength(50)
                        .IsUnicode(false);
                entity.Property(e => e.EntCode)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.Total);
                entity.Property(e => e.Classification)
              .HasMaxLength(50)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<BudgetCategory>().ToTable("BudgetCategory");
            modelBuilder.Entity<BudgetCategory>(entity =>
            {
                entity.Property(e => e.BudCatID).HasColumnName("BudCatID");
                entity.Property(e => e.BudgetID).HasColumnName("BudgetID");
                entity.Property(e => e.Category)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.Cost);
                entity.Property(e => e.CatOrder);
                entity.Property(e => e.Weight);
            });

            modelBuilder.Entity<BudgetDetail>().ToTable("BudgetDetail");
            modelBuilder.Entity<BudgetDetail>(entity =>
            {
                entity.Property(e => e.BudgetDetailID).HasColumnName("BudgetDetailID");
                entity.Property(e => e.BudCatID).HasColumnName("BudCatID");
                entity.Property(e => e.Item)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Code)
                   .HasMaxLength(10)
                   .IsUnicode(false);
                entity.Property(e => e.Basis)
                  .HasMaxLength(20)
                  .IsUnicode(false);
                entity.Property(e => e.Qty);
                entity.Property(e => e.Unit)
                  .HasMaxLength(20)
                  .IsUnicode(false);
                entity.Property(e => e.Rate);
                entity.Property(e => e.Note)
                  .HasMaxLength(255)
                  .IsUnicode(false);
                entity.Property(e => e.OnSched);
                entity.Property(e => e.DetailOrder);
            });

            modelBuilder.Entity<BudgetDefault>().ToTable("BudgetDefault");
            modelBuilder.Entity<BudgetDefault>(entity =>
            {
                entity.Property(e => e.ID).HasColumnName("ID");
                entity.Property(e => e.Code)
                   .HasMaxLength(30)
                   .IsUnicode(false);
                entity.Property(e => e.Description)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.Summary);
                entity.Property(e => e.Category);
                entity.Property(e => e.EntCode)
               .HasMaxLength(25)
               .IsUnicode(false);
            });

            modelBuilder.Entity<Deposit>().ToTable("Deposit");
            modelBuilder.Entity<Deposit>(entity =>
            {
                entity.Property(e => e.DepositID).HasColumnName("DepositID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.BudgetID).HasColumnName("BudgetID");
                entity.Property(e => e.DepositDate).HasColumnType("date");
                entity.Property(e => e.DepositType)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Reason)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Status)
                      .HasMaxLength(50)
                      .IsUnicode(false);
                entity.Property(e => e.Description)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Total);
                entity.Property(e => e.Addendum);
                entity.Property(e => e.FundingSource)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.FundingType)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.UseType)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.EntCode)
                  .HasMaxLength(25)
                  .IsUnicode(false);
            });

            modelBuilder.Entity<DepositView>().ToTable("vwDepositProject");
            modelBuilder.Entity<DepositView>(entity =>
            {
                entity.Property(e => e.DepositID).HasColumnName("DepositID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.BudgetID).HasColumnName("BudgetID");
                entity.Property(e => e.DepositDate).HasColumnType("date");
                entity.Property(e => e.DepositType)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Reason)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Status)
                      .HasMaxLength(50)
                      .IsUnicode(false);
                entity.Property(e => e.Description)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Total);
                entity.Property(e => e.Addendum);
                entity.Property(e => e.FundingSource)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.FundingType)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.UseType)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.EntCode)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.ProjectTitle)
                .HasMaxLength(100)
                .IsUnicode(false);
            });

            modelBuilder.Entity<DepositCategory>().ToTable("DepositCategory");
            modelBuilder.Entity<DepositCategory>(entity =>
            {
                entity.Property(e => e.DepCatID).HasColumnName("DepCatID");
                entity.Property(e => e.BudCatID).HasColumnName("BudCatID");
                entity.Property(e => e.DepositID).HasColumnName("DepositID");
                entity.Property(e => e.Deposit);
                entity.Property(e => e.CurrentFunding);
                entity.Property(e => e.AvailableBudget);
                entity.Property(e => e.BudgetID).HasColumnName("BudgetID");
            });

            modelBuilder.Entity<DepositCatSum>().ToTable("vwDepositCategoryTot");
            modelBuilder.Entity<DepositCatSum>(entity =>
            {
                entity.Property(e => e.BudCatID).HasColumnName("BudCatID");
                entity.Property(e => e.BudgetTot);
                entity.Property(e => e.DepositTot);
                entity.Property(e => e.Category)
                 .HasMaxLength(50)
                 .IsUnicode(false);
            });


            modelBuilder.Entity<DepositDetail>().ToTable("DepositDetail");
            modelBuilder.Entity<DepositDetail>(entity =>
            {
                entity.Property(e => e.DepositDetailID).HasColumnName("DepositDetailID");
                entity.Property(e => e.BudgetDetailID).HasColumnName("BudgetDetailID");
                entity.Property(e => e.BudCatID).HasColumnName("BudCatID");
                entity.Property(e => e.Deposit);
                entity.Property(e => e.Budget);
                entity.Property(e => e.CurrentFunding);
                entity.Property(e => e.LtdPurchasing);
                entity.Property(e => e.DepositID).HasColumnName("DepositID");
                entity.Property(e => e.DepCatID).HasColumnName("DepCatID");
            });

            modelBuilder.Entity<DepsoitDetLineSum>().ToTable("vwDepositCatDetails");
            modelBuilder.Entity<DepsoitDetLineSum>(entity =>
            {
                entity.Property(e => e.DepositDetailID).HasColumnName("DepositDetailID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.DepositID).HasColumnName("DepositID");
                entity.Property(e => e.BudgetDetailID).HasColumnName("BudgetDetailID");
                entity.Property(e => e.LineBudgetTotal).HasColumnName("LineBudgetTot");
                entity.Property(e => e.LineDepositTotal).HasColumnName("LineDepositTot");
            });

            //modelBuilder.Entity<VendorContact>().HasKey(o => new { o.VendorID, o.ContactID });
            modelBuilder.Entity<VendorContact>(entity =>
             {

                 entity.Property(e => e.VendorLinkID).HasColumnName("VendorLinkID");
                 entity.Property(e => e.VendorID).HasColumnName("VendorID");
                 entity.Property(e => e.VendorName)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                 entity.Property(e => e.EntCode)
                   .HasMaxLength(25)
                   .IsUnicode(false);
                 entity.Property(e => e.ContactID).HasColumnName("ContactID");
                 entity.Property(e => e.FirstName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                 entity.Property(e => e.LastName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                 entity.Property(e => e.Title)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                 entity.Property(e => e.Company)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                 entity.Property(e => e.PreferredName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                 entity.Property(e => e.ShowAsName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                 entity.Property(e => e.PhoneNumber)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                 entity.Property(e => e.EmailAddress)
                      .HasMaxLength(100)
                      .IsUnicode(false);

             });

            modelBuilder.Entity<EntContact>(entity =>
            {
                entity.HasKey(e => new { e.EntCode, e.ContactID });
                entity.ToTable("EntContact", "dbo");
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.FirstName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.LastName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Title)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.Company)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.PreferredName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.ShowAsName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.PhoneNumber)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.EmailAddress)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.EmailID).HasColumnName("EmailID");
                entity.Property(e => e.PhoneID).HasColumnName("PhoneID");

            });

            modelBuilder.Entity<ContactRole>().ToTable("vwContactRoles");
            modelBuilder.Entity<ContactRole>(entity =>
            {
                entity.Property(e => e.ProjectTeamID).HasColumnName("ProjectTeamID");
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.Role)
                   .HasMaxLength(20)
                   .IsUnicode(false);
                entity.Property(e => e.EntCode)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.ProjectNo)
                 .HasMaxLength(20)
                 .IsUnicode(false);
                entity.Property(e => e.Title)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Description)
                 .HasMaxLength(1000)
                 .IsUnicode(false);
                entity.Property(e => e.Phase)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Status)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Gsf);
            });

            //modelBuilder.Entity<ContractViewModel>().ToTable("vwContractView");
            //modelBuilder.Entity<ContractViewModel>(entity =>
            //{
            //    entity.Property(e => e.contract.ContractID).HasColumnName("ContractID");
            //    entity.Property(e => e.contract.ProjectID).HasColumnName("ProjectID");
            //    entity.Property(e => e.contract.VendorID).HasColumnName("VendorID");
            //    entity.Property(e => e.contract.AccountNo)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.Amount);
            //    entity.Property(e => e.contract.Description)
            //        .HasMaxLength(1000)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.Writer)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.Written);
            //    entity.Property(e => e.contract.Status)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.BondSecured)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.PoNo)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.PoReq)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.Bond)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.Insurance)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.EntCode)
            //        .HasMaxLength(25)
            //        .IsUnicode(false);
            //    entity.Property(e => e.contract.VendorName)
            //        .HasMaxLength(100)
            //        .IsUnicode(false);
            //    entity.Property(e => e.ProjectTitle)
            //        .HasMaxLength(50)
            //        .IsUnicode(false);

            //});

            modelBuilder.Entity<RFILookup>().ToTable("RFILookup");
            modelBuilder.Entity<RFILookup>(entity =>
            {
                entity.Property(e => e.RFI_ID).HasColumnName("RFI_ID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.ProjectTitle)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Writer)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Requester)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.RequesterCompany)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.RequestSummary)
                    .HasMaxLength(200)
                    .IsUnicode(false);
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Status)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.SenderRFINo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<RFI>().ToTable("RFI");
            modelBuilder.Entity<RFI>(entity =>
            {
                entity.Property(e => e.RFI_ID).HasColumnName("RFI_ID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.PrevRFI_ID).HasColumnName("PrevRFI_ID");
                entity.Property(e => e.Writer)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Requester)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Request)
                   .IsUnicode(false);
                entity.Property(e => e.RequesterCompany)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.RequestSummary)
                    .HasMaxLength(200)
                    .IsUnicode(false);
                entity.Property(e => e.Status)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.DateCreated).HasColumnType("date");
                entity.Property(e => e.SenderRFINo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Classification)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Category)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.DatePublished).HasColumnType("date");
                entity.Property(e => e.DateDue).HasColumnType("date");
                entity.Property(e => e.ToName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ToCompany)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Confirmation)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.EntCode)
                .HasMaxLength(25)
                .IsUnicode(false);
                entity.Property(e => e.Action)
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<RFIResponse>().ToTable("RFIResponse");
            modelBuilder.Entity<RFIResponse>(entity =>
            {
                entity.Property(e => e.RFIResponseID).HasColumnName("RFIResponseID");
                entity.Property(e => e.RFI_ID).HasColumnName("RFI_ID");
                entity.Property(e => e.RFIEmailID).HasColumnName("RFIEmailID");
                entity.Property(e => e.FromName)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.Response)
                   .IsUnicode(false);
                entity.Property(e => e.Company)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.CompanyCode)
                   .HasMaxLength(10)
                   .IsUnicode(false);
                entity.Property(e => e.Type)
                     .HasMaxLength(25)
                     .IsUnicode(false);
                entity.Property(e => e.IsAnswer);
                entity.Property(e => e.ResponseDate).HasColumnType("date");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
            });

            modelBuilder.Entity<Submittal>().ToTable("Submittal");
            modelBuilder.Entity<Submittal>(entity =>
            {
                entity.Property(e => e.SubmittalID).HasColumnName("SubmittalID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Classification)
               .HasMaxLength(25)
               .IsUnicode(false);
                entity.Property(e => e.Summary)
               .HasMaxLength(250)
               .IsUnicode(false);
                entity.Property(e => e.Category)
               .HasMaxLength(25)
               .IsUnicode(false);
                entity.Property(e => e.SubmittalNo)
               .HasMaxLength(50)
               .IsUnicode(false);
                entity.Property(e => e.PublishedDate).HasColumnType("date");
                entity.Property(e => e.DueDate).HasColumnType("date");
                entity.Property(e => e.Specification)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.FromName)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.FromCompany)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Description)
                 .IsUnicode(false);
                entity.Property(e => e.RecToName)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.RecToCompany)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.RecSummary)
                 .HasMaxLength(250)
                 .IsUnicode(false);
                entity.Property(e => e.ReviewerSubmittalNo)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.RevName)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.RevCompany)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Status)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Attachments)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.EntCode)
                .HasMaxLength(25)
                .IsUnicode(false);
                entity.Property(e => e.ReviewedDate).HasColumnType("date");
                entity.Property(e => e.ReviewedDateSent).HasColumnType("date");

            });

            modelBuilder.Entity<SubmittalDocLink>().ToTable("SubmittalDocLink");
            modelBuilder.Entity<SubmittalDocLink>(entity =>
            {
                entity.Property(e => e.SubmittalDocLinkID).HasColumnName("SubmittalDocLinkID");
                entity.Property(e => e.SubmittalID).HasColumnName("SubmittalID");
                entity.Property(e => e.DocID).HasColumnName("DocID");
                entity.Property(e => e.Type)
               .HasMaxLength(25)
               .IsUnicode(false);
            });

            modelBuilder.Entity<DistributionLog>().ToTable("DistributionLog");
            modelBuilder.Entity<DistributionLog>(entity =>
            {
                entity.Property(e => e.DistributionLogID).HasColumnName("DistributionLogID");
                entity.Property(e => e.MessageID).HasColumnName("MessageID");
                entity.Property(e => e.FromContactID).HasColumnName("FromContactID");
                entity.Property(e => e.ToContactID).HasColumnName("ToContactID");
                entity.Property(e => e.Activity)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.FromName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.FromCompany)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.ToName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ToCompany)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.DateSent).HasColumnType("date");
                entity.Property(e => e.DateReceived).HasColumnType("date");
                entity.Property(e => e.ItemType)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
            });

            modelBuilder.Entity<DocumentLink>().ToTable("DocumentLink");
            modelBuilder.Entity<DocumentLink>(entity =>
            {
                entity.Property(e => e.DocLinkID).HasColumnName("DocLinkID");
                entity.Property(e => e.DocID).HasColumnName("DocID");
                entity.Property(e => e.ItemNo).HasColumnName("ItemNo");
                entity.Property(e => e.ItemType)
                    .HasMaxLength(50)
                   .IsUnicode(false);
            });

            modelBuilder.Entity<RFIDocLink>().ToTable("RFIDocLink");
            modelBuilder.Entity<RFIDocLink>(entity =>
            {
                entity.Property(e => e.RFIDocLinkID).HasColumnName("RFIDocLinkID");
                entity.Property(e => e.RFI_ID).HasColumnName("RFI_ID");
                entity.Property(e => e.DocID).HasColumnName("DocID");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.Type)
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<EmailLookup>().ToTable("ContactEmails");
            modelBuilder.Entity<EmailLookup>().Property(e => e.ContactLinkID);

            modelBuilder.Entity<LocationLink>().ToTable("LocationLink");
            modelBuilder.Entity<LocationLink>(entity =>
            {
                entity.Property(e => e.LocationLinkID).HasColumnName("LocationLinkID");
                entity.Property(e => e.LocationID).HasColumnName("LocationID");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.ItemType)
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Contributor>().ToTable("vwContributor");
            modelBuilder.Entity<Contributor>(entity =>
            {
                entity.Property(e => e.ContactLinkID).HasColumnName("ContactLinkID");
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.ItemType)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.FirstName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.LastName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.Title)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.Label)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.ShowAsName)
                   .HasMaxLength(50)
                   .IsUnicode(false);
            });

            modelBuilder.Entity<Quote>().ToTable("Quote");
            modelBuilder.Entity<Quote>(entity =>
            {
                entity.Property(e => e.QuoteID).HasColumnName("QuoteID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.CreatedDate).HasColumnType("date");
                entity.Property(e => e.BidIssue).HasColumnType("date");
                entity.Property(e => e.PreBid).HasColumnType("date");
                entity.Property(e => e.DueDate).HasColumnType("date");
                entity.Property(e => e.TypeQuote)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.TypeWork)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.WorkIndex)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Description)
                  .HasMaxLength(1000)
                  .IsUnicode(false);
                entity.Property(e => e.AcctNo)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Status)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.AwardAmount);
                entity.Property(e => e.Budget);
                entity.Property(e => e.AwardedBidderID).HasColumnName("AwardedBidderID");
                entity.Property(e => e.PONo).HasColumnName("PONo");
                entity.Property(e => e.ContractNo).HasColumnName("ContractNo");
                entity.Property(e => e.EntCode)
                 .HasMaxLength(25)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<QuoteLookup>().ToTable("vwQuoteLookup");
            modelBuilder.Entity<QuoteLookup>(entity =>
            {
                entity.Property(e => e.QuoteID).HasColumnName("QuoteID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.CreatedDate).HasColumnType("date");
                entity.Property(e => e.BidIssue).HasColumnType("date");
                entity.Property(e => e.PreBid).HasColumnType("date");
                entity.Property(e => e.DueDate).HasColumnType("date");
                entity.Property(e => e.TypeQuote)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.TypeWork)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.WorkIndex)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Description)
                  .HasMaxLength(1000)
                  .IsUnicode(false);
                entity.Property(e => e.AcctNo)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Status)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.AwardAmount);
                entity.Property(e => e.Budget);
                entity.Property(e => e.AwardedBidderID).HasColumnName("AwardedBidderID");
                entity.Property(e => e.PONo).HasColumnName("PONo");
                entity.Property(e => e.ContractNo).HasColumnName("ContractNo");
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Title)
                  .HasMaxLength(100)
                  .IsUnicode(false);
            });

            modelBuilder.Entity<QuoteBid>().ToTable("QuoteBid");
            modelBuilder.Entity<QuoteBid>(entity =>
            {
                entity.Property(e => e.BidID).HasColumnName("BidID");
                entity.Property(e => e.QuoteID).HasColumnName("QuoteID");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.BaseBid);
                entity.Property(e => e.BidBond);
                entity.Property(e => e.MWDBE);
                entity.Property(e => e.BidTot);
                entity.Property(e => e.Comment)
                 .HasMaxLength(250)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<QuoteAddendum>().ToTable("QuoteAddendum");
            modelBuilder.Entity<QuoteAddendum>(entity =>
            {
                entity.Property(e => e.AddendumID).HasColumnName("AddendumID");
                entity.Property(e => e.QuoteID).HasColumnName("QuoteID");
                entity.Property(e => e.Title)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Description)
                    .HasMaxLength(500)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<QuoteBidAddendum>().ToTable("QuoteBidAddendum");
            modelBuilder.Entity<QuoteBidAddendum>(entity =>
            {
                entity.Property(e => e.BidAddendumID).HasColumnName("BidAddendumID");
                entity.Property(e => e.AddendumID).HasColumnName("AddendumID");
                entity.Property(e => e.BidID).HasColumnName("BidID");
                entity.Property(e => e.Acknowledgement);
            });

            modelBuilder.Entity<QuoteBidAlt>().ToTable("QuoteBidAlt");
            modelBuilder.Entity<QuoteBidAlt>(entity =>
            {
                entity.Property(e => e.BidAltID).HasColumnName("BidAltID");
                entity.Property(e => e.BidID).HasColumnName("BidID");
                entity.Property(e => e.Description)
                   .HasMaxLength(500)
                   .IsUnicode(false);
                entity.Property(e => e.Title)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.Amount);
                entity.Property(e => e.Selected);
            });

            modelBuilder.Entity<Contract>().ToTable("Contract");
            modelBuilder.Entity<Contract>(entity =>
            {
                entity.Property(e => e.ContractID).HasColumnName("ContractID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.QuoteID).HasColumnName("QuoteID");
                entity.Property(e => e.Description)
                     .HasMaxLength(500)
                     .IsUnicode(false);
                entity.Property(e => e.AccountNo)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.Writer)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.Status)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.PoNo)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.PoReq)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.Bond)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.BondSecured)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.Insurance)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.EntCode)
                     .HasMaxLength(50)
                     .IsUnicode(false);
                entity.Property(e => e.QuoteDescription)
                     .HasMaxLength(1000)
                     .IsUnicode(false);
                entity.Property(e => e.VendorName)
                     .HasMaxLength(100)
                     .IsUnicode(false);
                entity.Property(e => e.Amount);
                entity.Property(e => e.Written).HasColumnType("date");
            });

            modelBuilder.Entity<UserContact>().ToTable("UserContact");
            modelBuilder.Entity<UserContact>(entity =>
            {
                entity.Property(e => e.UserContactID).HasColumnName("UserContactID");
                entity.Property(e => e.UserEmail)
                     .HasMaxLength(100)
                     .IsUnicode(false);
                entity.Property(e => e.EntCode)
                     .HasMaxLength(25)
                     .IsUnicode(false);
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
            });

            modelBuilder.Entity<PO>().ToTable("PO");
            modelBuilder.Entity<PO>(entity =>
            {
                entity.Property(e => e.PoID).HasColumnName("PoID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.VendorPO)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.AccountNo)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.PODate).HasColumnType("date");
                entity.Property(e => e.RequestedBy)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.ReqNo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Service)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Type)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.QuoteCO)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.QuoteCOID).HasColumnName("QuoteCOID");
                entity.Property(e => e.ContractID).HasColumnName("ContractID");
                entity.Property(e => e.WorkStartDate).HasColumnType("WorkStartDate");
                entity.Property(e => e.WorkCompleteDate).HasColumnType("WorkCompleteDate");
                entity.Property(e => e.Terms)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.VendorPO)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.VendorPOAmount).HasColumnName("OriginalPOAmount");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.VendorContactID).HasColumnName("VendorContactID");
                entity.Property(e => e.VendorLocationID).HasColumnType("VendorLocationID");
                entity.Property(e => e.ShipToLocationID).HasColumnType("ShipToLocationID");
                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.PerComplete);
                entity.Property(e => e.Total);
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Writer)
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.ShipAddress1)
               .HasMaxLength(100)
               .IsUnicode(false);
                entity.Property(e => e.ShipAddress2)
               .HasMaxLength(100)
               .IsUnicode(false);
                entity.Property(e => e.ShipCity)
               .HasMaxLength(50)
               .IsUnicode(false);
                entity.Property(e => e.ShipState)
               .HasMaxLength(3)
               .IsUnicode(false);
                entity.Property(e => e.ShipZip)
               .HasMaxLength(10)
               .IsUnicode(false);
                entity.Property(e => e.ShippingAmount);
                entity.Property(e => e.TaxAmount);
                entity.Property(e => e.SpecialInstruction)
                .HasMaxLength(200)
                .IsUnicode(false);
                entity.Property(e => e.Exempt)
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<POLine>().ToTable("POLineItems");
            modelBuilder.Entity<POLine>(entity =>
            {
                entity.Property(e => e.PoLineID).HasColumnName("PoLineID");
                entity.Property(e => e.PoID).HasColumnName("PoID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Order);
                entity.Property(e => e.Code)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.AvailFunds);
                entity.Property(e => e.Price);
                entity.Property(e => e.Cost);
                entity.Property(e => e.VendorPartNo)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Description)
                  .HasMaxLength(200)
                  .IsUnicode(false);
                entity.Property(e => e.Unit)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.Quantity);
                entity.Property(e => e.VendDelvDate).HasColumnType("date");
                entity.Property(e => e.RequiredByDate).HasColumnType("date");
                entity.Property(e => e.OrderDate).HasColumnType("date");
                entity.Property(e => e.OnSched).HasColumnType("bool");
                entity.Property(e => e.PerComplete);
                entity.Property(e => e.POGroupID).HasColumnName("POGroupID");
            });

            modelBuilder.Entity<POGroup>().ToTable("POGroup");
            modelBuilder.Entity<POGroup>(entity =>
            {
                entity.Property(e => e.POGroupID).HasColumnName("POGroupID");
                entity.Property(e => e.PoID).HasColumnName("PoID");
                entity.Property(e => e.ItemType)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.Type)
                 .HasMaxLength(10)
                 .IsUnicode(false);
                entity.Property(e => e.Order);
                entity.Property(e => e.Status)
                 .HasMaxLength(25)
                 .IsUnicode(false);
                entity.Property(e => e.EnteredDate).HasColumnType("date");
                entity.Property(e => e.ApprovDate).HasColumnType("date");
                entity.Property(e => e.ItemDate).HasColumnType("date");
            });

            modelBuilder.Entity<LineCode>().ToTable("POAvailFunds");
            modelBuilder.Entity<LineCode>(entity =>
            {
                entity.Property(e => e.BudgetDetailID).HasColumnName("BudgetDetailID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Code)
                     .HasMaxLength(10)
                     .IsUnicode(false);
                entity.Property(e => e.Category)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.BudCatID).HasColumnName("BudCatID");
                entity.Property(e => e.Description)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.DepositTot);
                entity.Property(e => e.BudgetTot);
                entity.Property(e => e.AvailFunds);
            });

            modelBuilder.Entity<vwPOVendor>().ToTable("vwPOVendor");
            modelBuilder.Entity<vwPOVendor>(entity =>
            {
                entity.Property(e => e.PoID).HasColumnName("PoID");
                entity.Property(e => e.VendorName)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.ProjectTitle)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.VendorPO)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.AccountNo)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.PODate).HasColumnType("date");
                entity.Property(e => e.RequestedBy)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.ReqNo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Service)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Type)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.OriginalPO)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.QuoteCO)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.QuoteCOID).HasColumnName("QuoteCOID");
                entity.Property(e => e.ContractID).HasColumnName("ContractID");
                entity.Property(e => e.WorkStartDate).HasColumnType("WorkStartDate");
                entity.Property(e => e.WorkCompleteDate).HasColumnType("WorkCompleteDate");
                entity.Property(e => e.Terms)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.VendorPOAmount).HasColumnName("OriginalPOAmount");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.VendorContactID).HasColumnName("VendorContactID");
                entity.Property(e => e.VendorLocationID).HasColumnType("VendorLocationID");
                entity.Property(e => e.ShipToLocationID).HasColumnType("ShipToLocationID");
                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.PerComplete);
                entity.Property(e => e.Total);
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Writer)
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.ShipAddress1)
               .HasMaxLength(100)
               .IsUnicode(false);
                entity.Property(e => e.ShipAddress2)
               .HasMaxLength(100)
               .IsUnicode(false);
                entity.Property(e => e.ShipCity)
               .HasMaxLength(50)
               .IsUnicode(false);
                entity.Property(e => e.ShipState)
               .HasMaxLength(3)
               .IsUnicode(false);
                entity.Property(e => e.ShipZip)
               .HasMaxLength(10)
               .IsUnicode(false);
                entity.Property(e => e.ShippingAmount);
                entity.Property(e => e.TaxAmount);
                entity.Property(e => e.SpecialInstruction)
                .HasMaxLength(200)
                .IsUnicode(false);
                entity.Property(e => e.Exempt)
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Schedule>().ToTable("Schedule");
            modelBuilder.Entity<Schedule>(entity =>
            {
                entity.Property(e => e.SchedID).HasColumnName("SchedID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.CreatedBy)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.SalesPerson)
                   .HasMaxLength(100)
                   .IsUnicode(false);
                entity.Property(e => e.SalesPersonEmail)
                   .HasMaxLength(10)
                   .IsUnicode(false);
                entity.Property(e => e.SalesforceID)
                   .HasMaxLength(250)
                   .IsUnicode(false);
                entity.Property(e => e.EstimatedStart).HasColumnType("date");
                entity.Property(e => e.RequestedStart).HasColumnType("date");
                entity.Property(e => e.MaterialsDelivery).HasColumnType("date");
                entity.Property(e => e.InstallDate).HasColumnType("date");
                entity.Property(e => e.EntCode)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Status)
                 .HasMaxLength(50)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<QuoteAward>().ToTable("vwQuoteAwardedBid");
            modelBuilder.Entity<QuoteAward>(entity =>
            {
                entity.Property(e => e.QuoteID).HasColumnName("QuoteID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.ContractNo).HasColumnName("ContractNo");
                // .HasMaxLength(50)
                //.IsUnicode(false);
                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.VendorName)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.AwardAmount);
                entity.Property(e => e.PhoneID).HasColumnName("PhoneID");
                entity.Property(e => e.PhoneLabel)
                   .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.PhoneNumber)
                   .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.LocationID).HasColumnName("LocationID");
                entity.Property(e => e.LocationLabel)
                     .HasMaxLength(20)
                    .IsUnicode(false);
                entity.Property(e => e.Address1)
                     .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.Address2)
                     .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.AddCity)
                     .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.AddState)
                     .HasMaxLength(2)
                    .IsUnicode(false);
                entity.Property(e => e.AddZip)
                     .HasMaxLength(15)
                    .IsUnicode(false);
                entity.Property(e => e.Description)
                  .HasMaxLength(1000)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<CRM_Import>().ToTable("CRM_Import");
            modelBuilder.Entity<CRM_Import>(entity =>
            {
                entity.Property(e => e.CRM_ID).HasColumnName("CRM_ID");
                entity.Property(e => e.CRM_Type)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.AccountName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Contract)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.CreatedBy)
                      .HasMaxLength(50)
                      .IsUnicode(false);
                entity.Property(e => e.Description)
                      .HasMaxLength(1000)
                      .IsUnicode(false);
                entity.Property(e => e.OpportunityName)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Type)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Territory)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.RequestedStart);
                entity.Property(e => e.Created)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.SiteAddress1)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.SiteAddress2)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.SiteCity)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.SiteState)
                  .HasMaxLength(2)
                  .IsUnicode(false);
                entity.Property(e => e.ProjectCreated);
                entity.Property(e => e.OpportunityOwner)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.OppID)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.AccountID)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.OwnerID)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.OwnerPhone).HasColumnName("CreatedByPhone")
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.OwnerEmail).HasColumnName("CreatedByEmail")
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.Stage)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.isNew);
            });

            modelBuilder.Entity<ChangeOrder>().ToTable("CO");
            modelBuilder.Entity<ChangeOrder>(entity =>
            {
                entity.Property(e => e.ChangeOrderID).HasColumnName("ChangeOrderID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.AccountNo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.PoID).HasColumnName("PoID");
                entity.Property(e => e.RFIID).HasColumnName("RFIID");
                entity.Property(e => e.SpecSection)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Area)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.BidPkg)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.AEBulletinNo)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Attention)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ChangeToCompany)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ChangeToCompanyID).HasColumnName("ChangeToCompanyID");
                entity.Property(e => e.ChangeFromCompany)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.ChangeFromCompanyID).HasColumnName("ChangeFromCompanyID");
                entity.Property(e => e.ChangeSummary)
                    .HasMaxLength(100)
                    .IsUnicode(false);
                entity.Property(e => e.ChangeDescription)
                    .HasMaxLength(500)
                    .IsUnicode(false);
                entity.Property(e => e.HasAttachments);
                entity.Property(e => e.DocID);
                entity.Property(e => e.Reason)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.Response)
                    .HasMaxLength(200)
                    .IsUnicode(false);
                entity.Property(e => e.Quote);
                entity.Property(e => e.Estimate);
                entity.Property(e => e.FromContractor)
                    .HasMaxLength(200)
                    .IsUnicode(false);
                entity.Property(e => e.ToContractor)
                    .HasMaxLength(200)
                    .IsUnicode(false);
                entity.Property(e => e.FromContactID).HasColumnName("FromContactID");
                entity.Property(e => e.ToContactID).HasColumnName("ToContactID");
                entity.Property(e => e.Approved);
                entity.Property(e => e.DaysChanged);
                entity.Property(e => e.Status)
                   .HasMaxLength(50)
                   .IsUnicode(false);
            });

            modelBuilder.Entity<Skillset>().ToTable("Skillset");
            modelBuilder.Entity<Skillset>(entity =>
            {
                entity.Property(e => e.SkillsetId).HasColumnName("SkillsetId");
                entity.Property(e => e.Skill)
                    .HasMaxLength(50)
                    .IsUnicode(false).
                    HasColumnName("Skillset");
                entity.Property(e => e.Description)
                 .HasMaxLength(250)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<ProjectMgr>().ToTable("ProjectMgr");
            modelBuilder.Entity<ProjectMgr>(entity =>
            {
                entity.Property(e => e.PMId).HasColumnName("PMId");
                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.UserId)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
                entity.Property(e => e.Status)
                 .HasMaxLength(25)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<PMSkillset>().ToTable("PMSkillset");
            modelBuilder.Entity<PMSkillset>(entity =>
            {
                entity.Property(e => e.PMSkillsetId).HasColumnName("PMSkillsetId");
                entity.Property(e => e.PMId).HasColumnName("PMId");
                entity.Property(e => e.SkillsetId).HasColumnName("SkillsetId");
            });

            modelBuilder.Entity<PMSkillsetView>().ToTable("vwPMSkillsets");
            modelBuilder.Entity<PMSkillsetView>(entity =>
            {
                entity.Property(e => e.PMSkillsetId).HasColumnName("PMSkillsetId");
                entity.Property(e => e.PMId).HasColumnName("PMId");
                entity.Property(e => e.SkillsetId).HasColumnName("SkillsetId");
                entity.Property(e => e.PMId).HasColumnName("PMId");
                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.UserId)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Skill)
                   .HasMaxLength(50)
                   .IsUnicode(false).
                   HasColumnName("Skillset");
                entity.Property(e => e.ContactID).HasColumnName("ContactID");
            });

            modelBuilder.Entity<ProjectSkillset>().ToTable("ProjectSkillsetLink");
            modelBuilder.Entity<ProjectSkillset>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.SkillsetId).HasColumnName("SkillsetId");
            });

            modelBuilder.Entity<Invoice>().ToTable("Invoice");
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.Property(e => e.InvoiceID).HasColumnName("InvoiceID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.VendorID).HasColumnName("VendorID");
                entity.Property(e => e.VendorInvNo)
                   .HasMaxLength(25)
                   .IsUnicode(false);
                entity.Property(e => e.Received).HasColumnType("date");
                entity.Property(e => e.Paid).HasColumnType("date");
                entity.Property(e => e.VendorDate).HasColumnType("date");
                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);
                entity.Property(e => e.VendorInvAmount);
                entity.Property(e => e.ApprovToPay);
                entity.Property(e => e.POId).HasColumnName("POId");
                entity.Property(e => e.AccountNo)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.WorkStart).HasColumnType("date");
                entity.Property(e => e.WorkComplete).HasColumnType("date");
                entity.Property(e => e.VendorContactID).HasColumnName("VendorContactID");
                entity.Property(e => e.SpecialInstructions)
                  .HasMaxLength(250)
                  .IsUnicode(false);
                entity.Property(e => e.RequestBy)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.PerComplete);
                entity.Property(e => e.QuoteCOID).HasColumnName("QuoteCOID");
                entity.Property(e => e.VendorLocationID).HasColumnName("VendorLocationID");
                entity.Property(e => e.EntCode)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.Writer)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.ShipAddress1)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.ShipAddress2)
                  .HasMaxLength(100)
                  .IsUnicode(false);
                entity.Property(e => e.ShipCity)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.ShipState)
                  .HasMaxLength(2)
                  .IsUnicode(false);
                entity.Property(e => e.ShipZip)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.Terms)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.VendorPOAmount);
                entity.Property(e => e.Services)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Exempt)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.QuoteCO)
                  .HasMaxLength(10)
                  .IsUnicode(false);
                entity.Property(e => e.ContractID).HasColumnName("ContractID");
                entity.Property(e => e.RefNo)
                  .HasMaxLength(25)
                  .IsUnicode(false);
                entity.Property(e => e.ApprovToPay);
                entity.Property(e => e.VendorInvAmount);
            });

            modelBuilder.Entity<InvLine>().ToTable("InvoiceLine");
            modelBuilder.Entity<InvLine>(entity =>
            {
                entity.Property(e => e.InvLineID).HasColumnName("InvLineID");
                entity.Property(e => e.InvoiceID).HasColumnName("InvoiceID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Order);
                entity.Property(e => e.Code)
                 .HasMaxLength(10)
                 .IsUnicode(false);
                entity.Property(e => e.Price);
                entity.Property(e => e.Cost);
                entity.Property(e => e.VendorPartNo)
                .HasMaxLength(25)
                .IsUnicode(false);
                entity.Property(e => e.Description)
                .HasMaxLength(100)
                .IsUnicode(false);
                entity.Property(e => e.Unit)
                .HasMaxLength(10)
                .IsUnicode(false);
                entity.Property(e => e.Quantity);
                entity.Property(e => e.OnSched);
                entity.Property(e => e.PerComplete);
                entity.Property(e => e.AmountComplete);
                entity.Property(e => e.InvoiceToDate);
                entity.Property(e => e.BalToInvoice);
                entity.Property(e => e.CurrentInvAmount);
                entity.Property(e => e.CurrentAmountApproved);
                entity.Property(e => e.POBalance);
            });

            modelBuilder.Entity<MilestoneDefault>().ToTable("MilestonesDefault");
            modelBuilder.Entity<MilestoneDefault>(entity =>
            {
                entity.Property(e => e.MilestoneID).HasColumnName("MilestoneID");
                entity.Property(e => e.Type)
                    .HasMaxLength(10)
                    .IsUnicode(false);
                entity.Property(e => e.Milestone)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Order);
                entity.Property(e => e.DurationWKs);
                entity.Property(e => e.WT);
            });

            modelBuilder.Entity<MilestoneTask>().ToTable("MilestoneTask");
            modelBuilder.Entity<MilestoneTask>(entity =>
            {
                entity.Property(e => e.MilestoneTaskID).HasColumnName("MilestoneTaskID");
                entity.Property(e => e.MilestoneID).HasColumnName("MilestoneID");
                entity.Property(e => e.Task)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.Order);
            });

            modelBuilder.Entity<ProjectMilestone>().ToTable("ProjectMilestone");
            modelBuilder.Entity<ProjectMilestone>(entity =>
            {
                entity.Property(e => e.ProjectMilestoneID).HasColumnName("ProjectMilestoneID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.MilestoneID).HasColumnName("MilestoneID");
                entity.Property(e => e.Milestone)
                    .HasMaxLength(25)
                    .IsUnicode(false);
                entity.Property(e => e.Order);
                entity.Property(e => e.DurationWKs);
                entity.Property(e => e.WT);
                entity.Property(e => e.StartDate).HasColumnType("date");
                entity.Property(e => e.EndDate).HasColumnType("date");
            });

            modelBuilder.Entity<ShipTracking>().ToTable("ShipTracking");
            modelBuilder.Entity<ShipTracking>(entity =>
            {
                entity.Property(e => e.TrackingID).HasColumnName("TrackingID");
                entity.Property(e => e.POLineItemID).HasColumnName("POLineItemID");
                entity.Property(e => e.ItemID).HasColumnName("ItemID");
                entity.Property(e => e.ItemType)
                   .HasMaxLength(25)
                   .IsUnicode(false);
                entity.Property(e => e.ShipVendor)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.ItemType)
                   .HasMaxLength(25)
                   .IsUnicode(false);
                entity.Property(e => e.Qty);
                entity.Property(e => e.Status)
                  .HasMaxLength(50)
                  .IsUnicode(false);
            });

            modelBuilder.Entity<FieldReport>().ToTable("FieldReport");
            modelBuilder.Entity<FieldReport>(entity =>
            {
                entity.Property(e => e.FReportID).HasColumnName("FReportID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.ReportDate).HasColumnType("date");
                entity.Property(e => e.Weather)
                   .HasMaxLength(50)
                   .IsUnicode(false);
                entity.Property(e => e.Temp);
                entity.Property(e => e.Writer)
             .HasMaxLength(50)
             .IsUnicode(false);
                entity.Property(e => e.Description)
                    .IsUnicode(false);
            
            });

            modelBuilder.Entity<FRImage>().ToTable("FRImage");
            modelBuilder.Entity<FRImage>(entity =>
            {
                entity.Property(e => e.FRImageID).HasColumnName("FRImageID");
                entity.Property(e => e.FReportID).HasColumnName("FReportID");
                entity.Property(e => e.DocID).HasColumnName("DocID");

            });

            modelBuilder.Entity<ProjectLocationLookup>().ToTable("vwProjectLocations");
            modelBuilder.Entity<ProjectLocationLookup>(entity =>
            {
                entity.Property(e => e.LocationID).HasColumnName("LocationID");
                entity.Property(e => e.ProjectID).HasColumnName("ProjectID");
                entity.Property(e => e.Title)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Phase)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Status)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.Address1)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.Address2)
                 .HasMaxLength(100)
                 .IsUnicode(false);
                entity.Property(e => e.AddCity)
                 .HasMaxLength(50)
                 .IsUnicode(false);
                entity.Property(e => e.AddState)
                 .HasMaxLength(2)
                 .IsUnicode(false);
                entity.Property(e => e.AddZip)
                 .HasMaxLength(15)
                 .IsUnicode(false);
                entity.Property(e => e.isPrimary);
                entity.Property(e => e.Label)
               .HasMaxLength(20)
               .IsUnicode(false);
                entity.Property(e => e.Longitude);
                entity.Property(e => e.Latitude);
                entity.Property(e => e.Description)
                .HasMaxLength(1000)
                .IsUnicode(false);
                entity.Property(e => e.PM)
                .HasMaxLength(50)
                .IsUnicode(false);
                entity.Property(e => e.StartDate).HasColumnType("date");
                entity.Property(e => e.Duration);
                entity.Property(e => e.EntCode)
                 .HasMaxLength(25)
                 .IsUnicode(false);
            });

            modelBuilder.Entity<HeatMapLayer>().ToTable("HeatMapLayer");
            modelBuilder.Entity<HeatMapLayer>(entity =>
            {
                entity.Property(e => e.HeatMapLayerID).HasColumnName("HeatMapLayerID");
                entity.Property(e => e.Title)
                  .HasMaxLength(50)
                  .IsUnicode(false);
                entity.Property(e => e.Created).HasColumnType("date");
                entity.Property(e => e.Description)
                  .HasMaxLength(500)
                  .IsUnicode(false);
                entity.Property(e => e.EntCode)
                  .HasMaxLength(25)
                  .IsUnicode(false);
            });

            modelBuilder.Entity<HeatMapData>().ToTable("HeatMapData");
            modelBuilder.Entity<HeatMapData>(entity =>
            {
                entity.Property(e => e.HeatMapDataID).HasColumnName("HeatMapDataID");
                entity.Property(e => e.HeatMapLayerID).HasColumnType("int").HasColumnName("HeatMapLayerID");
                entity.Property(e => e.Latitude).HasColumnType("decimal");
                entity.Property(e => e.Longitude).HasColumnType("decimal");
                entity.Property(e => e.Weight);
                entity.Property(e => e.Description)
                   .HasMaxLength(50)
                   .IsUnicode(false);
            });
        }
    }
}
