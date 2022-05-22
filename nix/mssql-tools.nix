# Basado en derivación para skypeforlinux en nixpkgs

{ lib, stdenv, fetchurl, dpkg, glibc, unixODBC }:
let
  version = "17.9.1.1-1";
  ubuntuRelease = "21.10";
in stdenv.mkDerivation {
  pname = "mssql-tools";
  inherit version;

  system = "x86_64-linux";

  src =
    if stdenv.hostPlatform.system == "x86_64-linux" then
      fetchurl {
        url = "https://packages.microsoft.com/ubuntu/${ubuntuRelease}/prod/pool/main/m/mssql-tools/mssql-tools_${version}_amd64.deb";
        sha256 = "0ya9643assr80yh6g0nd3i6iw819frhbb1m421khwplk9iq793kk";
      }
    else
      throw "mssql-tools is not supported on ${stdenv.hostPlatform.system}";

  buildInputs = [ dpkg ];
  dontUnpack = true;
  outputs = [ "out" "doc" ];

  installPhase = ''
    mkdir -p $out
    dpkg -x $src $out
    mv $out/opt/mssql-tools/{bin,share} $out
    mv $out/usr/share/doc/mssql-tools $doc
    rm -r $out/opt $out/usr
  '';

  postFixup = let
    rpath = lib.makeLibraryPath [ glibc stdenv.cc.cc unixODBC ];
  in ''
    for file in $(find $out/bin -type f); do
      patchelf --set-interpreter "$(cat $NIX_CC/nix-support/dynamic-linker)" "$file"
      patchelf --set-rpath ${rpath} $file
    done
  '';

  meta = with lib; {
    license = licenses.unfree;
    platforms = [ "x86_64-linux" ];
  };
}
