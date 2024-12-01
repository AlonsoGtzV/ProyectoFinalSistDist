using Microsoft.EntityFrameworkCore;
using DokkanSoapApi.Infrastructure;
using DokkanSoapApi.Repositories;
using DokkanSoapApi.Contracts;
using DokkanSoapApi.Services;
using SoapCore;

var builder = WebApplication.CreateBuilder(args);

// Registrar el DbContext
builder.Services.AddDbContext<RelationalDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), 
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Registrar los servicios
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSoapCore();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<DokkanContract, UserService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ENDPOINTS
app.UseSoapEndpoint<DokkanContract>("/DokkanService.svc", new SoapEncoderOptions());

app.Run();

