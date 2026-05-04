using DataAccess;
using Mqtt.Controllers;

namespace Api.Controllers;

public class IotController(ILogger<IotController> logger, AppDbContext dbContext) : MqttController
{
    [MqttRoute("")]
    public async Task ListenForLogs(Log log)
    {
        await dbContext.Logs.AddAsync(log);
        await dbContext.SaveChangesAsync();
    }
    
    [MqttRoute("")]
    public async Task ListenForAlerts(Alert alert)
    {
        await dbContext.Alerts.AddAsync(alert);
        await dbContext.SaveChangesAsync();
    }
}
