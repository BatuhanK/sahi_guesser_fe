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
  ShieldHalf,
  Zap,
} from "lucide-react";
import React from "react";
import {
  CarListingDetails,
  HotelsListingDetails,
  HouseForRentListingDetails,
  HouseForSaleListingDetails,
  LetgoListingDetails,
  SportsPlayerListingDetails,
} from "../../../types/socket";


const hotelDetailsPropertyMap: Record<string, string> = {
  Features: "Özellik",
  "Hotel Rating": "Otel Puanı",
  "Hotel Type": "Otel Tipi",
  "Room Type": "Oda Tipi",
  "Review Count": "Yorum Sayısı",
};

const DetailPill: React.FC<{
  icon: React.ReactNode;
  text: React.ReactNode;
  label?: string;
}> = ({ icon, text, label }) => (
  <div className="inline-flex items-center shrink-0 bg-[var(--bg-primary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] shadow-md whitespace-nowrap">
    <span className="text-[var(--accent-color)] shrink-0">{icon}</span>
    {label ? (
      <>
        <span className="text-[var(--text-secondary)] mr-1.5 ml-1.5 text-xs lg:text-sm">
          {label}:
        </span>
        <span className="font-semibold text-[var(--text-primary)] text-xs lg:text-sm">
          {text}
        </span>
      </>
    ) : (
      <span className="font-semibold text-[var(--text-primary)] ml-1.5 text-xs lg:text-sm">
        {text}
      </span>
    )}
  </div>
);

export const CarDetails: React.FC<{ details: CarListingDetails }> = ({
  details,
}) => (
  <div className="flex flex-wrap gap-2 text-sm lg:text-base">
    {[
      {
        icon: <Car className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.brand} ${details.model}`,
      },
      {
        icon: <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.year}`,
      },
      {
        icon: <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.mileage} km`,
      },
      {
        icon: <Filter className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: details.fuelType,
      },
      {
        icon: <Move className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: details.transmission,
      },
    ].map((item, index) => (
      <DetailPill key={index} icon={item.icon} text={item.text} />
    ))}
  </div>
);

export const PropertyDetails: React.FC<{
  details: HouseForRentListingDetails | HouseForSaleListingDetails;
}> = ({ details }) => (
  <div className="flex flex-wrap gap-2 text-sm lg:text-base">
    {[
      {
        icon: <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.city}, ${details.district}`,
      },
      {
        icon: <Home className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.rooms} oda`,
      },
      {
        icon: <Maximize className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.squareMeters} m²`,
      },
      {
        icon: <Building2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `${details.buildingAge} yaşında`,
      },
      {
        icon: <ArrowDown className="h-3.5 w-3.5 lg:h-4 lg:w-4" />,
        text: `Kat: ${details.floor}`,
      },
    ].map((item, index) => (
      <DetailPill key={index} icon={item.icon} text={item.text} />
    ))}
  </div>
);

export const LetgoDetails: React.FC<{ details: LetgoListingDetails }> = ({
  details,
}) => (
  <div className="flex flex-wrap gap-2 text-sm lg:text-base">
    <DetailPill
      icon={<MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
      text={details.city}
    />
    {Object.entries(details.keyValues).map(([key, value], index) => (
      <DetailPill
        key={`${key}-${index}`}
        icon={<></>}
        text={value}
        label={key}
      />
    ))}
  </div>
);

export const HotelsDetails: React.FC<{ details: HotelsListingDetails }> = ({
  details,
}) => {
  return (
    <div className="flex flex-wrap gap-2 text-sm lg:text-base">
      <DetailPill
        icon={<MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
        text={`${details.city}, ${details.country}`}
      />
      <DetailPill
        key={`tarih`}
        icon={<></>}
        text={"Mart ayı"}
        label={"Tarih"}
      />
      {Object.entries(details.keyValues).map(([key, value], index) =>
        hotelDetailsPropertyMap[key] ? (
          <DetailPill
            key={`${key}-${index}`}
            icon={<></>}
            text={value}
            label={hotelDetailsPropertyMap[key]}
          />
        ) : null
      )}
    </div>
  );
};

export const SportsPlayerDetails: React.FC<{
  details: SportsPlayerListingDetails;
}> = ({ details }) => {
  return (
    <div className="flex flex-wrap gap-2 text-sm lg:text-base">
      <DetailPill
        icon={<ShieldHalf className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
        text={`${details.team}`}
      />
      {Object.entries(details.keyValues).map(([key, value], index) => (
        <DetailPill
          key={`${key}-${index}`}
          icon={<></>}
          text={value}
          label={key}
        />
      ))}
    </div>
  );
};
