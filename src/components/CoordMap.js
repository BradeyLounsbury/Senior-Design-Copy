import {GoogleMap, LoadScript, MarkerF, InfoWindowF} from '@react-google-maps/api';
import React, { useState } from 'react';
import mapStyles from "./mapStyles";

const mapContainerStyle = {
    height: "500px",
     
};

const center = {lat: 39.324300, lng: -82.101439};

const mapOptions = {
    styles: mapStyles,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    fullscreenControl: false,
};

class CoordMap extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
            {
                coords: null
            };
    }

    changeSelection(e)
    {
        this.setState({coords: [e.latLng.lat(), e.latLng.lng()]});
    }

    render(){
        return (
            <GoogleMap mapContainerStyle={mapContainerStyle}
                        zoom={13}
                        center={center}
                        options={mapOptions}
                        onClick={(e) => {this.changeSelection(e)} }>
            
                {this.state.coords && <MarkerF position={{lat: this.state.coords[0], lng: this.state.coords[1]}} />}

            </GoogleMap>
        );
    }
}

export default CoordMap;