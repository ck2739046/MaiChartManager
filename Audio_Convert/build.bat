@echo off

if exist "bin\Release" rmdir /s /q "bin\Release"
if exist "bin\Debug" rmdir /s /q "bin\Debug"

dotnet restore
dotnet publish -c Release

echo.
echo "bin\Release\net9.0\win-x64\publish\AudioConverter.exe"
echo.
pause
