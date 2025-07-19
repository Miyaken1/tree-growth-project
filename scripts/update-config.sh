#!/bin/bash

# 設定ファイルの一括更新

echo "Updating configuration files..."

# Google Apps Script URLの設定
read -p "Enter your Google Apps Script URL: " GAS_URL

if [ -n "$GAS_URL" ]; then
    # HTMLファイル内のURLを置換
    for file in *.html; do
        if [ -f "$file" ]; then
            sed -i.bak "s|YOUR_GOOGLE_APPS_SCRIPT_URL|$GAS_URL|g" "$file"
            rm "$file.bak"
            echo "Updated $file"
        fi
    done
    
    echo "Configuration updated successfully!"
else
    echo "No URL provided. Configuration not updated."
fi
