# Avalanche Local Node Management Script for Windows (PowerShell)
# Uses Docker to run Avalanche local network

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "status", "clean", "restart", "logs")]
    [string]$Action
)

# Docker container name
$ContainerName = "avalanche-local"
$ImageName = "avaplatform/avalanchego:latest"
$RPC_PORT = 9650

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Check-Docker {
    try {
        $null = docker --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "Docker is not installed!" "Red"
            Write-ColorOutput "Install from: https://www.docker.com/products/docker-desktop" "Yellow"
            return $false
        }
        return $true
    }
    catch {
        Write-ColorOutput "Error checking Docker: $_" "Red"
        return $false
    }
}

function Start-AvalancheNode {
    Write-ColorOutput "`nStarting Avalanche Local Node..." "Cyan"
    
    if (-not (Check-Docker)) { return }
    
    $existing = docker ps -a --filter "name=$ContainerName" -q
    
    if ($existing) {
        $running = docker ps --filter "name=$ContainerName" -q
        if ($running) {
            Write-ColorOutput "Node is already running!" "Green"
            Show-NodeStatus
            return
        }
        docker start $ContainerName | Out-Null
    }
    else {
        Write-ColorOutput "Creating new container..." "Cyan"
        docker run -d `
            --name $ContainerName `
            -p "${RPC_PORT}:9650" `
            $ImageName `
            /avalanchego/build/avalanchego `
            --http-host=0.0.0.0 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Container started!" "Green"
        Write-ColorOutput "`nRPC Endpoint: http://127.0.0.1:$RPC_PORT/ext/bc/C/rpc" "Cyan"
        Write-ColorOutput "Chain ID: 1337" "Cyan"
        Write-ColorOutput "`nPre-funded Account:" "Yellow"
        Write-ColorOutput "Address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC" "White"
        Write-ColorOutput "`nNext: yarn deploy:local`n" "Green"
    }
    else {
        Write-ColorOutput "Failed to start node!" "Red"
    }
}

function Stop-AvalancheNode {
    Write-ColorOutput "`nStopping node..." "Yellow"
    if (-not (Check-Docker)) { return }
    
    $running = docker ps --filter "name=$ContainerName" -q
    if ($running) {
        docker stop $ContainerName | Out-Null
        Write-ColorOutput "Node stopped!" "Green"
    }
    else {
        Write-ColorOutput "Node is not running" "Yellow"
    }
}

function Show-NodeStatus {
    Write-ColorOutput "`nAvalanche Node Status" "Cyan"
    if (-not (Check-Docker)) { return }
    
    $running = docker ps --filter "name=$ContainerName" -q
    if ($running) {
        Write-ColorOutput "Status: RUNNING" "Green"
        docker ps --filter "name=$ContainerName"
        Write-ColorOutput "`nRPC: http://127.0.0.1:$RPC_PORT/ext/bc/C/rpc" "Cyan"
    }
    else {
        $existing = docker ps -a --filter "name=$ContainerName" -q
        if ($existing) {
            Write-ColorOutput "Status: STOPPED" "Yellow"
        }
        else {
            Write-ColorOutput "Status: NOT CREATED" "Red"
        }
    }
}

function Clean-AvalancheNode {
    Write-ColorOutput "`nCleaning node..." "Yellow"
    if (-not (Check-Docker)) { return }
    
    $existing = docker ps -a --filter "name=$ContainerName" -q
    if ($existing) {
        docker rm -f $ContainerName | Out-Null
        Write-ColorOutput "Container removed!" "Green"
    }
    else {
        Write-ColorOutput "No container to clean" "Yellow"
    }
}

function Restart-AvalancheNode {
    Stop-AvalancheNode
    Start-Sleep -Seconds 2
    Start-AvalancheNode
}

function Show-NodeLogs {
    Write-ColorOutput "`nShowing logs (Ctrl+C to exit)...`n" "Cyan"
    if (-not (Check-Docker)) { return }
    
    $running = docker ps --filter "name=$ContainerName" -q
    if ($running) {
        docker logs -f $ContainerName
    }
    else {
        Write-ColorOutput "Node is not running!" "Red"
    }
}

# Main execution
switch ($Action) {
    "start" { Start-AvalancheNode }
    "stop" { Stop-AvalancheNode }
    "status" { Show-NodeStatus }
    "clean" { Clean-AvalancheNode }
    "restart" { Restart-AvalancheNode }
    "logs" { Show-NodeLogs }
}
