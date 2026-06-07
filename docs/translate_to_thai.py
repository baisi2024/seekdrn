# -*- coding: utf-8 -*-
"""
泰语翻译脚本 - 将中文产品信息翻译为泰语
"""
import json
import re

# 泰语翻译字典（关键词映射）
th_dict = {
    # 基础词汇
    "撰写评论": "เขียนรีวิว",
    "产品概述": "ภาพรวมผลิตภัณฑ์",
    "核心优势": "ข้อได้เปรียบหลัก",
    "授权应用场景": "สถานการณ์ประยุกต์ที่ได้รับอนุญาต",

    # 产品类型
    "无人机系统": "ระบบอากาศยานไร้คนขับ",
    "电动无人机系统": "ระบบอากาศยานไร้คนขับไฟฟ้า",
    "燃油动力": "ระบบขับเคลื่อนด้วยน้ำมัน",
    "高性能": "ประสิทธิภาพสูง",
    "轻型": "เบา",
    "重型": "หนัก",
    "中型": "ปานกลาง",
    "超轻型": "เบามาก",
    "超微型": "เล็กมาก",

    # 用途
    "合法国防": "การป้องกันที่ชอบด้วยกฎหมาย",
    "边境安全": "ความมั่นคงชายแดน",
    "人道主义救援": "การช่วยเหลือด้านมนุษยธรรม",
    "后勤保障": "การสนับสนุนโลจิสติกส์",
    "态势感知": "การรับรู้สถานการณ์",
    "安全响应": "การตอบสนองด้านความมั่นคง",
    "侦察": "การลาดตระเวน",

    # 技术参数
    "重量": "น้ำหนัก",
    "尺寸": "ขนาด",
    "最大起飞重量": "น้ำหนักบินขึ้นสูงสุด",
    "起飞方式": "วิธีบินขึ้น",
    "回收方式": "วิธีกู้คืน",
    "最大续航时间": "ระยะเวลาบินสูงสุด",
    "最大航程": "ระยะทางสูงสุด",
    "最大控制距离": "ระยะควบคุมสูงสุด",
    "巡航速度": "ความเร็วเดินทาง",
    "最大速度": "ความเร็วสูงสุด",
    "巡航高度": "ระดับความสูงเดินทาง",
    "最大升限": "ระดับสูงสุด",
    "抗风等级": "ความทนทานต่อลม",
    "通信系统": "ระบบสื่อสาร",
    "控制方式": "วิธีควบคุม",
    "载荷容量": "ความจุน้ำหนักบรรทุก",
    "推进系统": "ระบบขับเคลื่อน",

    # 特性
    "垂直起降": "การบินขึ้นและลงแบบแนวตั้ง",
    "弹射起飞": "การบินขึ้นด้วยแคตะพัลท์",
    "气动弹射": "แคตะพัลท์นิวมาติก",
    "降落伞回收": "กู้คืนด้วยร่มชูตัว",
    "自主返航": "การกลับฐานอัตโนมัติ",
    "遥控返航": "การกลับฐานด้วยรีโมท",
    "地面站控制": "การควบคุมจากสถานีภาคพื้นดิน",
    "数据链": "ลิงก์ข้อมูล",
    "卫星通信": "การสื่อสารดาวเทียม",
    "高清摄像头": "กล้องความละเอียดสูง",
    "光电吊舱": "พ็อดอิเล็กโทร-ออปติก",
    "热成像": "ภาพความร้อน",
    "激光测距": "การวัดระยะทางด้วยเลเซอร์",

    # 单位
    "kg": "kg",
    "km": "km",
    "m": "m",
    "mm": "mm",
    "小时": "ชั่วโมง",
    "分钟": "นาที",
    "级": "ระดับ",

    # 其他
    "无需跑道": "ไม่ต้องรันเวย์",
    "无需滑行道": "ไม่ต้องรันเวย์",
    "合法": "ที่ชอบด้วยกฎหมาย",
    "授权": "ที่ได้รับอนุญาต",
    "专业": "ที่เป็นมืออาชีพ",
    "符合国际法律法规": "ซึ่งเป็นไปตามกฎหมายระหว่างประเทศ",
    "仅供应给": "จัดหาให้เฉพาะ",
    "严禁未经授权使用": "ห้ามใช้โดยไม่ได้รับอนุญาตอย่างเด็ดขาด",
    "适用于": "ใช้ได้ใน",
    "无强制市场准入认证要求的地区": "พื้นที่ที่ไม่มีข้อกำหนดการรับรองการเข้าถึงตลาดบังคับ",
}

def translate_to_thai(text):
    """将中文文本翻译为泰语"""
    if not text:
        return text

    # 保留emoji
    result = text

    # 简单的词汇替换（实际应用中应使用专业翻译API）
    for zh, th in th_dict.items():
        result = result.replace(zh, th)

    return result

def translate_product(product):
    """翻译单个产品"""
    th_product = {
        "name": product["name"],
        "category": product["category"],
        "slug": product["slug"],
        "url": product["url"],
        "fullTitle": translate_to_thai(product.get("fullTitle", "")),
        "description": translate_to_thai(product.get("description", "")),
        "advantages": translate_to_thai(product.get("advantages", "")),
        "capabilities": translate_to_thai(product.get("capabilities", "")),
        "applications": translate_to_thai(product.get("applications", "")),
        "specs": {},
        "specCount": product.get("specCount", 0),
        "hasChinese": False
    }

    # 翻译specs
    for key, value in product.get("specs", {}).items():
        th_key = translate_to_thai(key)
        th_value = translate_to_thai(value)
        th_product["specs"][th_key] = th_value

    return th_product

def main():
    # 读取中文版本
    with open('products_zh.json', 'r', encoding='utf-8') as f:
        zh_products = json.load(f)

    print(f"读取到 {len(zh_products)} 个产品")

    # 翻译所有产品
    th_products = []
    for i, product in enumerate(zh_products, 1):
        print(f"正在翻译第 {i} 个产品: {product['name']}")
        th_product = translate_product(product)
        th_products.append(th_product)

    # 保存泰语版本
    with open('products_th.json', 'w', encoding='utf-8') as f:
        json.dump(th_products, f, ensure_ascii=False, indent=2)

    print(f"\n翻译完成！共翻译 {len(th_products)} 个产品")
    print("已保存到 products_th.json")

if __name__ == "__main__":
    main()
