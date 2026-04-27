using DataAccess;
using Mqtt.Controllers;

namespace Api.Controllers;

public class IotController(ILogger<IotController> logger, AppDbContext dbContext) : MqttController
{
    [MqttRoute("")]
    public async Task ListenForAlerts(Alert alert)
    {
        await dbContext.Alerts.AddAsync(alert);
        await dbContext.SaveChangesAsync();
    }
}
