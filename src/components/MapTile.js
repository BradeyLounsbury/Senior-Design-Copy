import {GoogleMap, LoadScript, MarkerF, InfoWindowF} from '@react-google-maps/api';
import React from 'react';
import mapStyles from "./mapStyles";

const center = {lat: 39.324300, lng: -82.101439};

const mapOptions = {
    styles: mapStyles,
    disableDefaultUI: false,
    zoomControl: false,
    mapTypeControl: true,
    fullscreenControl: false,
    streetViewControl: false
};

class MapTile extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
            {
                selected: null,
                width: window.innerWidth
            };

        window.addEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () =>
    {
        this.setState({width:window.innerWidth});
    }

    changeSelection(event)
    {
        this.setState({selected: event});
        this.props.updateEventID(event ? event.id : null);
        console.log(event);
    }

    render()
    {   
        const markers = this.props.getMarkers();
        console.log(markers)
        const isMobile = this.state.width <= 768;

        const mapContainerStyle = {
            height: isMobile ? "140vh" : "calc(100vh - 48px)",
            width: "100%"
             
        };

        return (
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={mapContainerStyle}
                        zoom={13}
                        center={center}
                        options={mapOptions}
                        onClick={() => this.changeSelection(null)}>
                
                {
                    markers.map((event) => (
                        <MarkerF
                            key={event.id}
                            position={event.coords? {lat: parseFloat(event.coords[0]), lng: parseFloat(event.coords[1])} : null}
                            onClick={() => this.changeSelection(event)}
                        />
                    ))
                }

                {this.state.selected ?
                    (<InfoWindowF position={{lat: parseFloat(this.state.selected.coords[0]), lng: parseFloat(this.state.selected.coords[1])}}
                                onCloseClick={() => this.changeSelection(null)}>
                        <div>
                            <h2>{this.state.selected.title}</h2>
                            <p>{"Starts: " + this.state.selected.startTime}</p>
                        </div>
                    </InfoWindowF>)
                    : null
                }
            </GoogleMap>
            </LoadScript>
        );
    }
}

export default MapTile;