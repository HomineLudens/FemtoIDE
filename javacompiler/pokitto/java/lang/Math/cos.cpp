static const std::uint8_t cosTable[] = {
    0xff, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe,
    0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd,
    0xfd, 0xfd, 0xfd, 0xfd, 0xfd, 0xfc, 0xfc, 0xfc,
    0xfc, 0xfb, 0xfb, 0xfb, 0xfb, 0xfa, 0xfa, 0xfa,
    0xfa, 0xf9, 0xf9, 0xf9, 0xf8, 0xf8, 0xf8, 0xf7,
    0xf7, 0xf6, 0xf6, 0xf6, 0xf5, 0xf5, 0xf4, 0xf4,
    0xf3, 0xf3, 0xf3, 0xf2, 0xf2, 0xf1, 0xf1, 0xf0,
    0xef, 0xef, 0xee, 0xee, 0xed, 0xed, 0xec, 0xec,
    0xeb, 0xea, 0xea, 0xe9, 0xe8, 0xe8, 0xe7, 0xe6,
    0xe6, 0xe5, 0xe4, 0xe4, 0xe3, 0xe2, 0xe2, 0xe1,
    0xe0, 0xdf, 0xdf, 0xde, 0xdd, 0xdc, 0xdc, 0xdb,
    0xda, 0xd9, 0xd8, 0xd7, 0xd7, 0xd6, 0xd5, 0xd4,
    0xd3, 0xd2, 0xd1, 0xd1, 0xd0, 0xcf, 0xce, 0xcd,
    0xcc, 0xcb, 0xca, 0xc9, 0xc8, 0xc7, 0xc6, 0xc5,
    0xc4, 0xc3, 0xc2, 0xc1, 0xc0, 0xbf, 0xbe, 0xbd,
    0xbc, 0xbb, 0xba, 0xb9, 0xb8, 0xb7, 0xb5, 0xb4,
    0xb3, 0xb2, 0xb1, 0xb0, 0xaf, 0xae, 0xac, 0xab,
    0xaa, 0xa9, 0xa8, 0xa7, 0xa5, 0xa4, 0xa3, 0xa2,
    0xa1, 0x9f, 0x9e, 0x9d, 0x9c, 0x9a, 0x99, 0x98,
    0x97, 0x95, 0x94, 0x93, 0x92, 0x90, 0x8f, 0x8e,
    0x8c, 0x8b, 0x8a, 0x88, 0x87, 0x86, 0x84, 0x83,
    0x82, 0x80, 0x7f, 0x7e, 0x7c, 0x7b, 0x7a, 0x78,
    0x77, 0x75, 0x74, 0x73, 0x71, 0x70, 0x6e, 0x6d,
    0x6c, 0x6a, 0x69, 0x67, 0x66, 0x64, 0x63, 0x61,
    0x60, 0x5f, 0x5d, 0x5c, 0x5a, 0x59, 0x57, 0x56,
    0x54, 0x53, 0x51, 0x50, 0x4e, 0x4d, 0x4b, 0x4a,
    0x48, 0x47, 0x45, 0x44, 0x42, 0x41, 0x3f, 0x3e,
    0x3c, 0x3b, 0x39, 0x38, 0x36, 0x35, 0x33, 0x31,
    0x30, 0x2e, 0x2d, 0x2b, 0x2a, 0x28, 0x27, 0x25,
    0x24, 0x22, 0x20, 0x1f, 0x1d, 0x1c, 0x1a, 0x19,
    0x17, 0x15, 0x14, 0x12, 0x11, 0x0f, 0x0e, 0x0c,
    0x0a, 0x09, 0x07, 0x06, 0x04, 0x03, 0x01, 0x00
};

if( angle < 0 ){
    constexpr uc_float::InternalType c = ~0 >> (32 - uc_float::FractionSize - 2);
    angle = uc_float::fromInternal(
        c - ((-angle).getInternal() & c)
        );
}

std::uint32_t iangle = (angle.getInternal() >> (uc_float::FractionSize - 8));
std::uint32_t quadrant = (iangle >> 8) & 3;
iangle &= 0xFF;

switch( quadrant ){
case 0:
    return uc_float::fromInternal( cosTable[iangle] );
case 1:
    return uc_float::fromInternal( -cosTable[255-iangle] );
case 2:
    return uc_float::fromInternal( -cosTable[iangle] );
case 3:
    return uc_float::fromInternal( cosTable[255-iangle] );
default:
    return 0;
}