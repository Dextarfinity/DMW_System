Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\SAO25\OneDrive\Desktop\PROCUREMENT SERVER\DMW_System\server"
WshShell.Run "cmd /c pm2 resurrect", 0, False
