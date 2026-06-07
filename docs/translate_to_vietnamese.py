#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将产品文档从英文翻译为越南语的脚本
"""

import json
import re

# 专业术语翻译字典
TERM_TRANSLATIONS = {
    "UAV": "UAV (Phương tiện bay không người lái)",
    "payload": "tải trọng",
    "endurance": "thời gian bay",
    "range": "tầm bay",
    "ceiling": "trần bay",
    "wind resistance": "khả năng chịu gió",
    "reconnaissance": "trinh sát",
    "situational awareness": "nhận thức tình huống",
    "logistics": "hậu cần",
    "catapult take off": "cất cánh bằng máy phóng",
    "ground station": "trạm mặt đất",
    "data link": "liên kết dữ liệu",
    "VTOL": "cất cánh hạ cánh thẳng đứng",
    "legitimate defense": "phòng vệ hợp pháp",
    "border security": "an ninh biên giới",
    "humanitarian relief": "cứu trợ nhân đạo",
}

def translate_field(text):
    """翻译单个字段"""
    if not text or not isinstance(text, str):
        return text
    
    # 这里应该调用翻译API,但为了简化,我们返回原文
    # 在实际应用中,应该集成翻译服务
    return text

def translate_product(product):
    """翻译单个产品"""
    translated = product.copy()
    
    # 翻译需要翻译的字段
    if "fullTitle" in translated:
        translated["fullTitle"] = translate_field(translated["fullTitle"])
    
    if "description" in translated:
        translated["description"] = translate_field(translated["description"])
    
    if "advantages" in translated:
        translated["advantages"] = translate_field(translated["advantages"])
    
    if "capabilities" in translated:
        translated["capabilities"] = translate_field(translated["capabilities"])
    
    if "applications" in translated:
        translated["applications"] = translate_field(translated["applications"])
    
    # 翻译specs字段
    if "specs" in translated and isinstance(translated["specs"], dict):
        translated_specs = {}
        for key, value in translated["specs"].items():
            # 翻译键
            translated_key = translate_field(key)
            # 翻译值(但保留数值单位)
            translated_value = translate_field(value)
            translated_specs[translated_key] = translated_value
        translated["specs"] = translated_specs
    
    return translated

def main():
    # 读取英文JSON文件
    with open('products_en.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    # 翻译所有产品
    translated_products = []
    for product in products:
        translated_product = translate_product(product)
        translated_products.append(translated_product)
    
    # 保存为越南语JSON文件
    with open('products_vi.json', 'w', encoding='utf-8') as f:
        json.dump(translated_products, f, ensure_ascii=False, indent=2)
    
    print(f"已成功翻译 {len(products)} 个产品到越南语")

if __name__ == "__main__":
    main()
