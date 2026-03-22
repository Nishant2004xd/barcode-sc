from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404

from .models import Product
from .serializers import ProductSerializer
from .utils import parse_excel, generate_barcode_image, generate_qr_image


class UploadProductsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith(('.xlsx', '.xls')):
            return Response({'error': 'Only Excel files (.xlsx, .xls) are supported.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            products_data = parse_excel(file)
        except Exception as e:
            return Response({'error': f'Failed to parse Excel: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        created, updated = 0, 0
        for data in products_data:
            item_code = data.pop('item_code')
            product, is_new = Product.objects.update_or_create(
                item_code=item_code,
                defaults=data,
            )

            # Generate barcode and QR code images
            product.barcode_image.save(
                f'{item_code}_barcode.png',
                generate_barcode_image(item_code),
                save=False,
            )
            product.qr_image.save(
                f'{item_code}_qr.png',
                generate_qr_image(item_code),
                save=False,
            )
            product.save()

            if is_new:
                created += 1
            else:
                updated += 1

        return Response({
            'message': f'Upload complete. {created} created, {updated} updated.',
            'total': created + updated,
            'created': created,
            'updated': updated,
        }, status=status.HTTP_200_OK)


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Product.objects.all()

        # Optional filters
        category = request.query_params.get('category')
        brand = request.query_params.get('brand')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        if category:
            queryset = queryset.filter(category__icontains=category)
        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if status_filter:
            queryset = queryset.filter(status__iexact=status_filter)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(item_code__icontains=search)

        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, item_code):
        product = get_object_or_404(Product, item_code=item_code)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
