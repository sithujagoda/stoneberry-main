import urllib.request
url = 'https://dfeaetodlymxpsrxnsai.supabase.co/storage/v1/object/public/gems/289bf43b72a44de38cf737d01aac7cfc.jpg'
try:
    req = urllib.request.Request(url, method='HEAD')
    with urllib.request.urlopen(req) as resp:
        print("Status:", resp.status)
except Exception as e:
    print("Error:", str(e))
    try:
        with urllib.request.urlopen(url) as resp:
            pass
    except urllib.error.HTTPError as he:
        print("HTTP Error Response:", he.read().decode('utf-8', errors='ignore'))
