import path from "path";
import { generateApi } from "swagger-typescript-api";

async function generateApiTypes() {
  try {
    await generateApi({
      name: "api.types.ts",
      output: path.resolve(process.cwd(), "./src/types/generated"),
      url: "http://localhost:5000/api/v1/swagger.json", // URL to your Swagger/OpenAPI docs
      generateClient: false, // We only want types, not the client
      generateRouteTypes: true,
      defaultResponseAsSuccess: false,
      singleHttpClient: true,
      // modular: true,
      prettier: {
        printWidth: 100,
        tabWidth: 2,
        trailingComma: "all",
      },
      primitiveTypeConstructs: constructs => ({
        ...constructs,
        object: "Record<string, any>",
      }),
      templates: "./swagger-templates",
      hooks: {
        onCreateComponent: (component) => {
          // You can modify component here
          console.log(`Generated component ${component.name}`);
          return component;
        },
      },
    });

    console.log("API Types generated successfully!");
  }
  catch (error) {
    console.error("Error generating API types:", error);
    process.exit(1);
  }
}

generateApiTypes();