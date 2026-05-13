using DataAccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.EfRealtime;
using StateleSSE.AspNetCore.GroupRealtime;

namespace Api.Controllers;

public class WebClientController(ISseBackplane backplane,
    IRealtimeManager realtimeManager,
    AppDbContext db,
    IGroupRealtimeManager groupRealtimeManager
) : RealtimeControllerBase(backplane)
{
    [HttpGet(nameof(GetLogs))]
    public async Task<RealtimeListenResponse<List<Log>>> GetLogs(string connectionId)
    {
        var group = "logs";
        await backplane.Groups.AddToGroupAsync(connectionId, group);
        realtimeManager.Subscribe<AppDbContext>(connectionId, group,
            criteria: snapshot => snapshot.HasChanges<Log>(),
            query: async context => context.Logs.Include(l => l.User).AsNoTracking().ToList()
        );
        return new RealtimeListenResponse<List<Log>>(group, db.Logs.Include(l => l.User).AsNoTracking().ToList());
    }
    
    [HttpGet(nameof(GetAlerts))]
    public async Task<RealtimeListenResponse<List<Alert>>> GetAlerts(string connectionId)
    {
        var group = "alerts";
        await backplane.Groups.AddToGroupAsync(connectionId, group);
        realtimeManager.Subscribe<AppDbContext>(connectionId, group,
            criteria: snapshot => snapshot.HasChanges<Alert>(),
            query: async context => context.Alerts.ToList()
        );
        return new RealtimeListenResponse<List<Alert>>(group, db.Alerts.ToList());
    }
}
