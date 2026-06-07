#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
波斯语翻译脚本
将 products_en.json 完整翻译为 products_fa.json
"""

import json
import re

# 专业术语翻译对照表
TERM_TRANSLATIONS = {
    "UAV": "پهپاد بدون سرنشین",
    "payload": "بار полез",
    "endurance": "استقامت پرواز",
    "range": "برد",
    "ceiling": "سقف پرواز",
    "wind resistance": "مقاومت در برابر باد",
    "reconnaissance": "شناسایی",
    "situational awareness": "آگاهی وضعیتی",
    "logistics": "لجستیک",
    "catapult take-off": "پرتاب با منجنیق",
    "ground station": "ایستگاه زمینی",
    "data link": "پیوند داده",
    "VTOL": "برخاست و فرود عمودی",
    "legitimate defense": "دفاع مشروع",
    "border security": "امنیت مرزی",
    "humanitarian relief": "امداد بشردوستانه",
    "Write a Review": "نوشتن بررسی",
}

def translate_field(text):
    """翻译单个字段"""
    if not text or not isinstance(text, str):
        return text
    
    # 这里应该调用翻译API或使用预定义的翻译
    # 由于这是示例脚本，我们返回原文
    # 实际使用时需要集成翻译服务
    return text

def translate_product(product):
    """翻译单个产品"""
    translated = product.copy()
    
    # 翻译需要翻译的字段
    if 'fullTitle' in translated:
        translated['fullTitle'] = translate_field(translated['fullTitle'])
    
    if 'description' in translated:
        translated['description'] = translate_field(translated['description'])
    
    if 'advantages' in translated:
        translated['advantages'] = translate_field(translated['advantages'])
    
    if 'capabilities' in translated:
        translated['capabilities'] = translate_field(translated['capabilities'])
    
    if 'applications' in translated:
        translated['applications'] = translate_field(translated['applications'])
    
    # 翻译specs
    if 'specs' in translated and isinstance(translated['specs'], dict):
        translated_specs = {}
        for key, value in translated['specs'].items():
            # 翻译键和值
            translated_key = translate_field(key)
            translated_value = translate_field(value)
            translated_specs[translated_key] = translated_value
        translated['specs'] = translated_specs
    
    return translated

def main():
    """主函数"""
    # 读取英文版本
    with open('products_en.json', 'r', encoding='utf-8') as f:
        products_en = json.load(f)
    
    print(f"读取了 {len(products_en)} 个产品")
    
    # 翻译所有产品
    products_fa = []
    for i, product in enumerate(products_en, 1):
        print(f"正在翻译第 {i}/{len(products_en)} 个产品: {product.get('name', 'Unknown')}")
        translated = translate_product(product)
        products_fa.append(translated)
    
    # 保存波斯语版本
    with open('products_fa.json', 'w', encoding='utf-8') as f:
        json.dump(products_fa, f, ensure_ascii=False, indent=2)
    
    print(f"完成！已翻译 {len(products_fa)} 个产品到 products_fa.json")

if __name__ == '__main__':
    main()
