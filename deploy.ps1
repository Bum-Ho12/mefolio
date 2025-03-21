# deploy.ps1

# Deploy and save output to file
npx vercel --prod > deployment-url.txt 2> error.txt

# Check if successful
if ($LASTEXITCODE -eq 0) {
    # Extract the deployment URL from the output
    $deploymentUrl = (Get-Content deployment-url.txt | Select-String -Pattern 'https://[^ ]*\.vercel\.app').Matches.Value | Select-Object -Last 1

    # Alias the deployment to your preferred domain
    npx vercel alias $deploymentUrl bum-ho.vercel.app

    Write-Host "✅ Successfully deployed and aliased to bum-ho.vercel.app" -ForegroundColor Green
} else {
    # Handle the error
    $errorMessage = Get-Content error.txt
    Write-Host "❌ Deployment failed: $errorMessage" -ForegroundColor Red
}

# Clean up temporary files
Remove-Item -Path deployment-url.txt, error.txt -ErrorAction SilentlyContinue