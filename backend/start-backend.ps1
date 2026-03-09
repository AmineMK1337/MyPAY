$java17Home = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot'

if (-not (Test-Path $java17Home)) {
  Write-Error "Java 17 not found at: $java17Home"
  exit 1
}

$env:JAVA_HOME = $java17Home
$env:Path = "$java17Home\bin;$env:Path"

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
mvn spring-boot:run
