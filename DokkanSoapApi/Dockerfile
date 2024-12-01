FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8085

ENV ASPNETCORE_URLS=http://+:8085
ENV ConnectionStrings__DefaultConnection "Server=localhost;Database=users;User=root;Password=admin;Port=3306;"

# Eliminar la configuración del usuario "app" para evitar problemas de permisos
# USER app

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src

# Copiar y restaurar dependencias
COPY ["DokkanSoapApi.csproj", "DokkanSoapApi/"]
RUN dotnet restore "DokkanSoapApi/DokkanSoapApi.csproj"

# Copiar todo el código fuente
COPY . . 
WORKDIR "/src"
# Crear el directorio de salida y asegurarse de que tiene los permisos correctos
RUN mkdir -p /app/build && chmod -R 777 /app/build
RUN dotnet build "DokkanSoapApi.csproj" -c $configuration -o /app/build

FROM build AS publish
ARG configuration=Release
RUN dotnet publish "DokkanSoapApi.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish . 
ENTRYPOINT ["dotnet", "DokkanSoapApi.dll"]
