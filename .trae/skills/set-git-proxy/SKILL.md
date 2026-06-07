---
name: "set-git-proxy"
description: "Sets Git HTTP/HTTPS proxy to http://127.0.0.1:10808. Invoke when user needs to configure Git proxy for GitHub access or when network connection to GitHub fails."
---

# Set Git Proxy

This skill configures Git to use HTTP/HTTPS proxy for accessing GitHub and other remote repositories.

## When to Use

Invoke this skill when:
- User asks to set up Git proxy
- User needs to access GitHub but has connection issues
- User mentions "set proxy", "configure proxy", or "git proxy"
- Skills installation fails due to GitHub connection issues
- User is in a network-restricted environment (e.g., corporate firewall, China mainland)

## What It Does

Sets the following Git global configurations:
- `http.proxy` = `http://127.0.0.1:10808`
- `https.proxy` = `https://127.0.0.1:10808`

## Usage

Simply invoke the skill, and it will automatically configure the proxy settings.

## Verification

After setting the proxy, you can verify with:
```bash
git config --global --list | grep proxy
```

## Notes

- The proxy address is hardcoded to `http://127.0.0.1:10808`
- This assumes you have a proxy service running on port 10808
- If you need a different proxy address, you'll need to modify this skill
- To remove the proxy settings, use the `remove-git-proxy` skill

## Common Proxy Ports

- 10808: Common for Clash, V2Ray
- 7890: Common for Clash default port
- 1080: Common for SOCKS proxies

## Troubleshooting

If the proxy doesn't work:
1. Ensure your proxy software is running
2. Check if the proxy port is correct (default: 10808)
3. Verify the proxy is working with: `curl -x http://127.0.0.1:10808 https://github.com`
