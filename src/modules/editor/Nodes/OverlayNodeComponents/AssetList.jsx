import { Button } from "@mui/material";
import * as React from "react";
import { textureExtensions } from "../../../../constants";
import { cleanFirebaseUrl, getOrganizationAssets } from "../../../../helpers";

export function AssetList(props) {
  const [assets, setAssets] = React.useState(null);
  // const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [refresh, setRefresh] = React.useState(true);
  //const [count, setCount] = React.useState(0);

  const setUserAssets = async () => {
    const organizationId = window.organizationId;
    let userAssets = await getOrganizationAssets(organizationId);
    if (!userAssets.error) {
      setAssets(userAssets);
      setSearch("");
    }
  };

  React.useEffect(() => {
    setUserAssets();
  }, [refresh]);

  const extensions = textureExtensions;

  if (assets) {
    return (
      <div className="images">
        {/* <button onClick={() => setRefresh(!refresh)}>refresh</button> */}

        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1em" }}>
          <Button
            variant="contained"
            className="uplaodAsset"
            style={{ marginRight: "1em", width: "100px", backgroundColor: "#ffffff", color: "#222222" }}
            onClick={(e) => {
              e.preventDefault();
              window.open(
                "https://admin.badvisor.io/assets",
                "Assets",
                "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,resizable=no,height=768,width=1024"
              );
            }}
          >
            UPLOAD
          </Button>
          <input
            value={search}
            placeholder="Search by Name"
            onChange={(e) => {
              setSearch(e.target.value);
              //setPage(1);
            }}
          />
        </span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",

            overflow: "auto",
            gap: "1rem",
          }}
        >
          {assets
            .map((item, i) => {
              return ((item.url && extensions.includes(item.type)) || (item.customUrl && extensions.includes(item.customUrl.split(".").pop()))) &&
                ((search && item.name.indexOf(search) !== -1) || !search) ? (
                <Button
                  key={i}
                  style={{
                    display: "flex",
                    width: "240px",
                    height: "240px",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.2)",
                    // color: theme.palette.text.main,
                    color: "#222222",
                    alignItems: "center",
                    overflow: "hidden",
                    padding: 0,
                  }}
                  className="image"
                  onClick={() => props.setAsset(item.customUrl || cleanFirebaseUrl(item.url))}
                >
                  <img alt={item.name} style={{ display: "block", width: "100%" }} src={item.customUrl || cleanFirebaseUrl(item.url)} />
                  <div
                    style={{
                      background: "#ffffff",

                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      position: "absolute",
                      bottom: 0,
                    }}
                  >
                    {item.name}
                  </div>
                </Button>
              ) : null;
            })
            .sort((a, b) => {
              if (a && b) {
                return Date(b.updatedAt || 0) - Date(a.updatedAt || 0);
              }
            })}
        </div>
      </div>
    );
  } else {
    return null;
  }
}
