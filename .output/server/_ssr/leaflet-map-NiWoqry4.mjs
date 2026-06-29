import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leaflet-map-NiWoqry4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
function getZoomForLocation(location) {
	const type = location.type?.toLowerCase() ?? "";
	if (type.includes("country")) return 5;
	if (type.includes("state") || type.includes("region") || type.includes("province")) return 7;
	if (type.includes("city") || type.includes("town") || type.includes("village")) return 10;
	if (type.includes("neighborhood") || type.includes("suburb") || type.includes("borough") || type.includes("district")) return 12;
	return 9;
}
function LeafletMap({ locations, interactive = false, onMarkerClick }) {
	const mapRef = (0, import_react.useRef)(null);
	const mapInstanceRef = (0, import_react.useRef)(null);
	const markersRef = (0, import_react.useRef)([]);
	const mapReadyRef = (0, import_react.useRef)(false);
	const initialViewRef = (0, import_react.useRef)(locations.length === 1 ? {
		center: [locations[0].lat, locations[0].lng],
		zoom: getZoomForLocation(locations[0])
	} : locations.length > 1 ? {
		center: [locations[0].lat, locations[0].lng],
		zoom: 4
	} : {
		center: [20, 0],
		zoom: 2
	});
	const syncMarkers = (0, import_react.useEffectEvent)(() => {
		const map = mapInstanceRef.current;
		if (!map || !mapReadyRef.current) return;
		let frameId = null;
		markersRef.current.forEach(({ marker, clickHandler }) => {
			if (clickHandler) marker.off("click", clickHandler);
			marker.remove();
		});
		markersRef.current = [];
		const validLocations = locations.filter((loc) => Number.isFinite(loc.lat) && Number.isFinite(loc.lng) && !(loc.lat === 0 && loc.lng === 0));
		if (validLocations.length === 0) {
			map.setView([20, 0], 2);
			return;
		}
		validLocations.forEach((loc) => {
			const marker = import_leaflet_src.default.marker([loc.lat, loc.lng]).addTo(map).bindPopup(`<div class="text-sm"><p class="font-medium">${loc.name}</p>${loc.type ? `<p class="text-xs opacity-70 capitalize">${loc.type}</p>` : ""}</div>`);
			let clickHandler;
			if (onMarkerClick) {
				clickHandler = () => onMarkerClick(loc);
				marker.on("click", clickHandler);
			}
			markersRef.current.push({
				marker,
				clickHandler
			});
		});
		frameId = requestAnimationFrame(() => {
			map.invalidateSize();
			if (validLocations.length === 1) {
				const zoomLevel = getZoomForLocation(validLocations[0]);
				map.setView([validLocations[0].lat, validLocations[0].lng], zoomLevel, { animate: false });
				return;
			}
			const bounds = import_leaflet_src.default.latLngBounds(validLocations.map((loc) => [loc.lat, loc.lng]));
			if (bounds.isValid()) {
				const northEast = bounds.getNorthEast();
				const southWest = bounds.getSouthWest();
				const latSpan = Math.abs(northEast.lat - southWest.lat);
				const lngSpan = Math.abs(northEast.lng - southWest.lng);
				if (latSpan < .01 && lngSpan < .01) {
					bounds.extend([northEast.lat + .05, northEast.lng + .05]);
					bounds.extend([southWest.lat - .05, southWest.lng - .05]);
				}
			}
			map.fitBounds(bounds, {
				padding: [50, 50],
				animate: false,
				maxZoom: 12
			});
		});
		return () => {
			if (frameId !== null) cancelAnimationFrame(frameId);
			markersRef.current.forEach(({ marker, clickHandler }) => {
				if (clickHandler) marker.off("click", clickHandler);
				marker.remove();
			});
			markersRef.current = [];
		};
	});
	const locationsKey = locations.map((location) => `${location.id}:${location.lat}:${location.lng}:${location.name}`).join("|");
	(0, import_react.useEffect)(() => {
		if (!mapRef.current || mapInstanceRef.current) return;
		delete import_leaflet_src.default.Icon.Default.prototype._getIconUrl;
		import_leaflet_src.default.Icon.Default.mergeOptions({
			iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
			iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
			shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
		});
		const map = import_leaflet_src.default.map(mapRef.current, {
			center: initialViewRef.current.center,
			zoom: initialViewRef.current.zoom,
			scrollWheelZoom: interactive,
			dragging: interactive,
			zoomControl: interactive
		});
		if (interactive) import_leaflet_src.default.control.zoom({ position: "topright" }).addTo(map);
		import_leaflet_src.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" }).addTo(map);
		mapInstanceRef.current = map;
		const handleMapReady = () => {
			mapReadyRef.current = true;
			syncMarkers();
		};
		map.whenReady(handleMapReady);
		return () => {
			map.off("load", handleMapReady);
			map.remove();
			mapInstanceRef.current = null;
			mapReadyRef.current = false;
		};
	}, [interactive]);
	(0, import_react.useEffect)(() => {
		return syncMarkers();
	}, [
		interactive,
		locationsKey,
		onMarkerClick
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: mapRef,
		className: "size-full"
	});
}
//#endregion
export { LeafletMap };
