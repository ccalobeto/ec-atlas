const shapefile = require("shapefile");

Promise.all([
  parseInput(),
  shapefile.read("build/SHP/nxcantones.shp"),
  shapefile.read("build/SHP/nxprovincias.shp")
]).then(output);

function parseInput() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin
        .on("data", chunk => chunks.push(chunk))
        .on("end", () => {
          try { resolve(JSON.parse(chunks.join(""))); }
          catch (error) { reject(error); }
        })
        .setEncoding("utf8");
  });
}

function output([topology, cantons, provinces]) {
  cantons = new Map(cantons.features.map(d => [d.properties.DPA_CANTON, d.properties]));
  // permite agregar el nombre de departamento dentro del topojson 
  // y dentro de objects.cantons.geometries.properties.name
  provinces = new Map(provinces.features.map(d => [d.properties.DPA_PROVIN, d.properties]));

  for (const canton of topology.objects.cantons.geometries) {
    canton.properties = {
      name: cantons.get(canton.id).DPA_DESCAN
    };
  }

  for (const province of topology.objects.provinces.geometries) {
    province.properties = {
      name: provinces.get(province.id).DPA_DESPRO
    };
  }

  process.stdout.write(JSON.stringify(topology));
  process.stdout.write("\n");
}