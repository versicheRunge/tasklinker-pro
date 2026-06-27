Function URLDecode(s)
  Dim i, result
  result = ""
  i = 1
  Do While i <= Len(s)
    If Mid(s, i, 1) = "%" And i + 2 <= Len(s) Then
      result = result & Chr(CInt("&H" & Mid(s, i + 1, 2)))
      i = i + 3
    Else
      result = result & Mid(s, i, 1)
      i = i + 1
    End If
  Loop
  URLDecode = result
End Function

Dim raw, path, pos
raw = WScript.Arguments(0)

pos = InStr(raw, "://")
If pos > 0 Then
  path = Mid(raw, pos + 3)
Else
  pos = InStr(raw, ":")
  If pos > 0 Then path = Mid(raw, pos + 1)
End If

path = URLDecode(path)
CreateObject("Shell.Application").Open(path)
