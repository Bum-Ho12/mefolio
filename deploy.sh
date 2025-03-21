#!/bin/bash

# Deploy and save output to file
npx vercel --prod > deployment-url.txt 2> error.txt

# Check exit code
code=$?

if [ $code -eq 0 ]; then
    # Extract the deployment URL from the output
    deploymentUrl=$(cat deployment-url.txt | grep -o 'https://[^ ]*\.vercel\.app' | tail -1)

    # Alias the deployment to your preferred domain
    npx vercel alias $deploymentUrl bum-ho.vercel.app

    echo "✅ Successfully deployed and aliased to bum-ho.vercel.app"
else
    # Handle the error
    errorMessage=$(cat error.txt)
    echo "❌ Deployment failed: $errorMessage"
fi

# Clean up temporary files
rm -f deployment-url.txt error.txt