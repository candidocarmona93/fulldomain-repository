<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImmobileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'code'              => $this->code,
            'title'             => $this->title,
            'slug'              => $this->slug,
            'description'       => $this->description,
            'type_image'        => $this->type_image,
            'picture'           => $this->picture,
            'price'             => $this->price,
            'currency'          => $this->currency,
            'category'          => $this->category,
            'neighborhood'      => $this->neighborhood,
            'owner'             => $this->owner,
            'address'           => $this->address,
            'area'              => $this->area,
            'room'              => $this->room,
            'bathroom'          => $this->bathroom,
            'car'               => $this->car,
            'pool'              => $this->pool,
            'cave'              => $this->cave,
            'wifi'              => $this->wifi,
            'park'              => $this->park,
            'kitchen'           => $this->kitchen,
            'pantry'            => $this->pantry,
            'electric_oven'     => $this->electric_oven,
            'gym'               => $this->gym,
            'laundry'           => $this->laundry,
            'balcony'           => $this->balcony,
            'service_area'      => $this->service_area,
            'cctv'              => $this->cctv,
            'equipped_kitchen'  => $this->equipped_kitchen,
            'suit'              => $this->suit,
            'acclimatized'      => $this->acclimatized,
            'generator'         => $this->generator,
            'guard'             => $this->guard,
            'twenty_four_hour_security'  => $this->twenty_four_hour_security,
            'reception_area'    => $this->reception_area,
            'living_room'       => $this->living_room,
            'terrace'           => $this->terrace,
            'elevator'          => $this->elevator,
            'built_in_stove'    => $this->built_in_stove,
            'desk'              => $this->desk,
            'courtyard'         => $this->courtyard,
            'attachments'       => $this->attachments,
            'garden'            => $this->garden,
            'furnished'         => $this->furnished,
            'latitude'          => $this->latitude,
            'longitude'         => $this->longitude,
            'views'             => $this->views,
            'finality'          => $this->finality,
            'responsible'       => $this->responsible,
            'emphasis'          => $this->emphasis,
            'gallery'           => $this->immobile_gallery,
            'comments'          => $this->comment,
            'status'            => $this->status,
            'created_at'        => $this->created_at->diffForHumans(['parts' => 1, 'join' => ', ']),
            'updated_at'        => $this->updated_at->diffForHumans(['parts' => 1, 'join' => ', ']),
        ];
    }
}
