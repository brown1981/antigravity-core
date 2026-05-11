import urllib.request
import json
import sys

def audit_token(address):
    """
    GoPlus API を使用して、指定されたトークンのセキュリティリスクを診断します。
    """
    if not address.startswith('0x'):
        return json.dumps({"error": "Invalid address format. Must start with 0x."}, ensure_ascii=False)

    try:
        # チェーンID 1 (Ethereum) をデフォルトとして使用
        url = f"https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses={address}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            if data.get('code') != 1:
                return json.dumps({"error": "API returned an error code."}, ensure_ascii=False)
            
            result = data.get('result', {}).get(address.lower())
            if not result:
                return json.dumps({"error": "No security data found for this address."}, ensure_ascii=False)
            
            # 主要なリスク項目の抽出
            audit_report = {
                "token_name": result.get("token_name"),
                "is_honeypot": "DETECTED" if result.get("is_honeypot") == "1" else "CLEAR",
                "buy_tax": f"{float(result.get('buy_tax', 0)) * 100:.1f}%",
                "sell_tax": f"{float(result.get('sell_tax', 0)) * 100:.1f}%",
                "is_renounced": "YES" if result.get("owner_address") == "0x0000000000000000000000000000000000000000" else "NO",
                "is_proxy": "YES" if result.get("is_proxy") == "1" else "NO",
                "trust_list": "YES" if result.get("trust_list") == "1" else "NO"
            }
            
            # 総合判定
            risks = []
            if result.get("is_honeypot") == "1": risks.append("ハニーポットの疑い")
            if float(result.get("sell_tax", 0)) > 0.1: risks.append("高い売却手数料")
            if result.get("owner_address") != "0x0000000000000000000000000000000000000000": risks.append("所有権が放棄されていません")
            
            audit_report["verdict"] = "⚠️ RISK DETECTED" if risks else "✅ SECURE"
            audit_report["risk_details"] = risks
            
            return json.dumps(audit_report, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(audit_token(sys.argv[1]))
    else:
        # テスト用アドレス (WETH)
        print(audit_token("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"))
