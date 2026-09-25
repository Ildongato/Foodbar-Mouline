# Publieke Sectigo-tussencertificaten

De FTP-server stuurt alleen het leaf-certificaat; macOS vult de keten aan, Ubuntu/curl niet.
Deze publieke intermediates zijn op 25 september 2026 opgehaald van de officiële distributie:

- http://crt.sectigo.com/SectigoPublicServerAuthenticationCADVR36.crt
- http://crt.sectigo.com/SectigoPublicServerAuthenticationRootR46_USERTrust.crt

Bron: https://www.sectigo.com/knowledge-base/detail/Access-New-Sectigo-Certificate-Chain

De DER-certificaten zijn zonder inhoudswijziging naar PEM geconverteerd. De volledige
serverketen is cryptografisch geverifieerd tegen de bestaande systeemroots. De workflow
verifieert de intermediates opnieuw tegen Ubuntu's bestaande CA-store vóór gebruik.
Deze bestanden bevatten geen private sleutels, wachtwoorden of zelfondertekende trust anchors.
Geen systeemwijziging: de aangevulde CA-bundel geldt alleen voor de FTPS-deployment.
Hostnamevalidatie en vervalcontrole blijven actief; `--insecure` wordt nooit gebruikt.
