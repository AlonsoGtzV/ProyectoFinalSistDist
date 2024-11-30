FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8085

ENV ASPNETCORE_URLS=http://+:8085

USER app
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src
COPY ["DokkanSoapApi/DokkanSoapApi.csproj", "DokkanSoapApi/"]
RUN dotnet restore "DokkanSoapApi/DokkanSoapApi.csproj"
COPY . .
WORKDIR "/src/DokkanSoapApi"
RUN dotnet build "DokkanSoapApi.csproj" -c $configuration -o /app/build

FROM build AS publish
ARG configuration=Release
RUN dotnet publish "DokkanSoapApi.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DokkanSoapApi.dll"]
