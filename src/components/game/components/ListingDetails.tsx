import React from 'react';
import {
  ArrowDown,
  Building2,
  Calendar,
  Car,
  Filter,
  Home,
  MapPin,
  Maximize,
  Move,
  Zap,
} from "lucide-react";
import {
  CarListingDetails,
  HouseForRentListingDetails,
  LetgoListingDetails,
} from "../../../types/socket";

export const CarDetails: React.FC<{ details: CarListingDetails }> = ({ details }) => (
  <div className="flex flex-wrap gap-2 lg:gap-4 text-sm lg:text-base">
    <div className="flex items-center gap-1 lg:gap-2">
      <Car className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>
        {details.brand} {details.model}
      </span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Calendar className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.year}</span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Zap className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.mileage} km</span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Filter className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.fuelType}</span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Move className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.transmission}</span>
    </div>
  </div>
);

export const PropertyDetails: React.FC<{ details: HouseForRentListingDetails }> = ({ details }) => (
  <div className="flex flex-wrap gap-2 lg:gap-4 text-sm lg:text-base">
    <div className="flex items-center gap-1 lg:gap-2">
      <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>
        {details.city}, {details.district}
      </span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Home className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.rooms} oda</span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Maximize className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.squareMeters} m²</span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <Building2 className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>{details.buildingAge} yaşında</span>
    </div>
    <div className="flex items-center gap-1 lg:gap-2">
      <ArrowDown className="h-4 w-4 lg:h-5 lg:w-5" />
      <span>Kat: {details.floor}</span>
    </div>
  </div>
);

export const LetgoDetails: React.FC<{ details: LetgoListingDetails }> = ({ details }) => (
  <div className="flex flex-wrap gap-2 lg:gap-3 text-sm lg:text-base">
    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
      <MapPin className="h-4 w-4 lg:h-5 lg:w-5 mr-1.5" />
      <span>{details.city}</span>
    </div>
    {Object.entries(details.keyValues).map(([key, value], index) => (
      <div
        key={`${key}-${index}`}
        className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
      >
        <span className="text-white/80 mr-1.5">{key}:</span>
        <span className="font-medium">{value}</span>
      </div>
    ))}
  </div>
); 