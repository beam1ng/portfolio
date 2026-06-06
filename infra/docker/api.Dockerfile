# syntax=docker/dockerfile:1
# Multi-stage build for the ASP.NET Core API. Build context = repo root.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first (cached unless a .csproj or props changes).
COPY backend/Directory.Build.props backend/
COPY backend/src/Portfolio.Domain/Portfolio.Domain.csproj backend/src/Portfolio.Domain/
COPY backend/src/Portfolio.Application/Portfolio.Application.csproj backend/src/Portfolio.Application/
COPY backend/src/Portfolio.Infrastructure/Portfolio.Infrastructure.csproj backend/src/Portfolio.Infrastructure/
COPY backend/src/Portfolio.Api/Portfolio.Api.csproj backend/src/Portfolio.Api/
RUN dotnet restore backend/src/Portfolio.Api/Portfolio.Api.csproj

# Build + publish.
COPY backend/ backend/
RUN dotnet publish backend/src/Portfolio.Api/Portfolio.Api.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Portfolio.Api.dll"]
