from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    barcode_image_url = serializers.SerializerMethodField()
    qr_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'item_code', 'category', 'brand', 'name',
            'mrp', 'selling_price', 'hsn', 'qty', 'status', 'show_online',
            'barcode_image_url', 'qr_image_url', 'created_at', 'updated_at',
        ]

    def get_barcode_image_url(self, obj):
        request = self.context.get('request')
        if obj.barcode_image and request:
            return request.build_absolute_uri(obj.barcode_image.url)
        return None

    def get_qr_image_url(self, obj):
        request = self.context.get('request')
        if obj.qr_image and request:
            return request.build_absolute_uri(obj.qr_image.url)
        return None
