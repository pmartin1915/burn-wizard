@echo off
echo 🔧 Setting up Tauri build environment...
set PATH=%PATH%;C:\Users\perry\.cargo\bin

echo ✅ Testing Rust installation...
rustc --version
if errorlevel 1 (
    echo ❌ Rust not found in PATH
    echo Trying direct path...
    "C:\Users\perry\.cargo\bin\rustc.exe" --version
)

echo ✅ Testing Cargo installation...
cargo --version
if errorlevel 1 (
    echo ❌ Cargo not found in PATH  
    echo Trying direct path...
    "C:\Users\perry\.cargo\bin\cargo.exe" --version
)

echo 🚀 Starting Tauri build...
npx tauri build --verbose

echo ✅ Build completed!
pause