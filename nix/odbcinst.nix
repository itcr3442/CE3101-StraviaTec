{ lib, writeTextDir, unixODBCDrivers }:
with lib; let
  driver = unixODBCDrivers.msodbcsql17;
  odbcinst."${driver.fancyName}" = {
    Description = driver.meta.description;
    Driver = "${driver}/${driver.driver}";
  };
in writeTextDir "odbcinst.ini" (generators.toINI {} odbcinst)
