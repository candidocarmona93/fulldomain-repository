<?php

namespace App\Http\Controllers;

use App\Http\Resources\ImmobileResource;
use App\Models\Immobile;
use App\Models\ImmobileGallery;
use Artesaos\SEOTools\Facades\JsonLd;
use Artesaos\SEOTools\Facades\OpenGraph;
use Artesaos\SEOTools\Facades\SEOMeta;
use Illuminate\Http\Request;
use Stevebauman\Hypertext\Transformer;

class ImmobileController extends Controller
{
    public function show($slug) {
        $seo = Immobile::select('id', 'slug', 'code', 'title', 'description', 'picture', 'category_id')->where([['slug', $slug],['status', '=', 1]])->first();
        $model = Immobile::where([['slug', $slug],['status', '=', 1]])->get();
        if(isset($seo->id) > 0) {
            $gallery = ImmobileGallery::where('immobile_id', '=', $seo->id)->get();
        } else {
            return redirect("https://casacoimbramaputo.com");
        }

        SEOMeta::setTitle($seo->title);
        SEOMeta::setDescription($seo->description);
        SEOMeta::addMeta('fb:section', $seo->category_id, 'property');
        SEOMeta::addKeyword([$seo->title, 'Vende-se', 'Arrenda-se']);

        OpenGraph::setDescription((new Transformer)->keepNewLines()->toText($seo->description));
        OpenGraph::setTitle($seo->title);
        OpenGraph::setUrl('https://imoveis.casacoimbramputo.com/'.$seo->slug);
        OpenGraph::addProperty('type', 'Imóveis');
        OpenGraph::addProperty('locale', 'pt-pt');
        OpenGraph::addProperty('locale:alternate', ['pt-pt', 'en-us']);

        // OpenGraph::addImage('https://workspace.casacoimbramaputo.com/uploads/immobiles/'.$seo->code.'/'.$seo->picture);
        // OpenGraph::addImage(['url' => 'https://workspace.casacoimbramaputo.com/uploads/immobiles/'.$seo->code.'/'.$seo->picture, 'size' => 400]);
        OpenGraph::addImage('https://workspace.casacoimbramaputo.com/uploads/immobiles/'.$seo->code.'/'.$seo->picture, ['height' => 400, 'width' => 400]);

        JsonLd::setTitle($seo->title);
        JsonLd::setDescription($seo->description);
        JsonLd::setType('Imóveis');
        JsonLd::addImage($seo->picture);

        $immobiles = ImmobileResource::collection($model);

        return view('immobile', compact('immobiles', 'gallery'));
    }
}
