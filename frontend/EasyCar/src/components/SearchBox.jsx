import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  OutlinedInput,
  Button,
} from "@mui/material";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

const SearchBox = (props) => {
  const { selectPosition, setSelectedPosition } = props;
  const [searchText, setSearchText] = useState("");
  const [listPlace, setListPlace] = useState([]);

  // Effect when selectPosition is set
  React.useEffect(() => {
    if (selectPosition) {
      setSearchText(selectPosition.display_name); // Set the search text to selected position's name
      setListPlace([]); // Clear the list when a position is selected
    }
  }, [selectPosition]);

  const handleSearch = () => {
    const params = {
      q: searchText,
      format: "json",
      addressdetails: 1,
      polygon_geojson: 0,
    };
    const queryString = new URLSearchParams(params).toString();
    const requestOptions = { method: "GET", redirect: "follow" };
    fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const data = JSON.parse(result);
        setListPlace(data);
      })
      .catch((err) => console.log("err: ", err));
  };

  const handleClear = () => {
    setSearchText(""); // Clear the search box
    setListPlace([]); // Clear the list
    setSelectedPosition(null); // Clear the selected position
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", color: "white" }}>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <OutlinedInput
            style={{ width: "100%", color: "white" }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // White border for the input
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // White border on hover
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white", // White border when focused
              },
              "& .MuiInputBase-input": {
                color: "white", // White text for the input
              },
            }}
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
          />
        </div>
        <div
          style={{ display: "flex", alignItems: "center", padding: "0px 20px" }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ color: "white", backgroundColor: "#1976d2" }} // White text with blue background
          >
            Search
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            sx={{
              color: "white",
              borderColor: "white",
              marginLeft: "10px",
              "&:hover": {
                borderColor: "white", // White border on hover
              },
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {!selectPosition && (
        <div>
          <List component="nav" aria-label="main mailbox folders">
            {listPlace.map((item) => {
              return (
                <div key={item?.osm_id}>
                  <ListItem
                    button
                    onClick={() => {
                      setSelectedPosition(item); // Set the selected position
                    }}
                    sx={{ color: "white" }} // White text for list items
                  >
                    <ListItemText primary={item?.display_name} />
                  </ListItem>
                  <Divider sx={{ backgroundColor: "white" }} />{" "}
                  {/* White divider */}
                </div>
              );
            })}
          </List>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
