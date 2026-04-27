using System.ComponentModel.DataAnnotations;
using System.Text;
using Api.Services;
using DataAccess;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Mqtt.Controllers;
using StackExchange.Redis;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.Extensions;
using StateleSSE.AspNetCore.GroupRealtime;

namespace Api;

public class Program
{
    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<AppOptions>(provider =>
        {
            var configuration = provider.GetRequiredService<IConfiguration>();
            var appOptions = new AppOptions();
            configuration.GetSection(nameof(AppOptions)).Bind(appOptions);
            return appOptions;
        });
        
        services.AddDbContext<AppDbContext>((services, options) =>
        {
            options.UseNpgsql(services.GetRequiredService<AppOptions>().DbConnectionString);
            options.AddEfRealtimeInterceptor(services);
        });
        
        services.Configure<HostOptions>(opts => opts.ShutdownTimeout = TimeSpan.FromSeconds(0));
        
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var appOptions = sp.GetRequiredService<AppOptions>();
            
            var config = ConfigurationOptions.Parse(appOptions.RenderConnectionString);
            config.AbortOnConnectFail = false;
            return ConnectionMultiplexer.Connect(config);
        });

        services.AddRedisSseBackplane();
        
        services.AddEfRealtime();
        services.AddGroupRealtime();
        
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IServiceProvider>((options, sp) =>
            {
                var appOptions = sp.GetRequiredService<AppOptions>();
                var key = Encoding.UTF8.GetBytes(appOptions.Token);

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = appOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = appOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateLifetime = true
                };
            });

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer();
        
        services.AddMqttControllers();
        services.AddControllers();
        services.AddOpenApi();
        services.AddOpenApiDocument();
        services.AddCors();
        
        services.AddScoped<IAuthService, AuthService>();
        
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();
    }

    public static async Task Main()
    {
        var builder = WebApplication.CreateBuilder();
        ConfigureServices(builder.Services);
        var app = builder.Build();
        
        var appOptions = app.Services.GetRequiredService<AppOptions>();
        Validator.ValidateObject(appOptions, new ValidationContext(appOptions), true);
        app.UseExceptionHandler();
        app.UseOpenApi();
        app.UseSwaggerUi();
        
        app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(x => true));
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        
        var mqttClient = app.Services.GetRequiredService<IMqttClientService>();
        await mqttClient.ConnectAsync(appOptions.MqttBroker);
        
        app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts");
        app.Run();
    }
}