{ lib, buildGoModule, fetchFromGitHub }:
let
  version = "7.5.0";
in buildGoModule {
  pname = "rqlite";
  inherit version;

  src = fetchFromGitHub {
    owner = "rqlite";
    repo = "rqlite";
    rev = "v${version}";
    sha256 = "0hi5kq8w26i8azlcxy750zmbciga6l5n090ir261n00djigm5m59";
  };

  vendorSha256 = "sha256-YT1nK1vFmNCRJyWOiQhSJr83qW8uxkHXCZ81/Ch6qpg=";
  doCheck = false;
}
