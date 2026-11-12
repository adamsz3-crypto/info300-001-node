INFO 300 - INFRASTRUCTURE DECISION TOOL

SUBNET EXAMPLE: SUFFICIENT

Input:
  VPC CIDR: /16
  Subnet CIDR: /24
  Devices required: 100

Calculation:
  Total addresses = 2^(32 - 24) = 256
  AWS-reserved addresses = 5
  Usable addresses = 256 - 5 = 251
  Unused usable addresses = 251 - 100 = 151

Expected result:
  VPC/Subnet consistency: CONSISTENT
  Subnet capacity: SUFFICIENT
  Unused usable IP addresses: 151

SUBNET EXAMPLE: NOT SUFFICIENT

Input:
  VPC CIDR: /16
  Subnet CIDR: /24
  Devices required: 300

Calculation:
  Total addresses = 2^(32 - 24) = 256
  AWS-reserved addresses = 5
  Usable addresses = 256 - 5 = 251
  Additional usable addresses needed = 300 - 251 = 49

Expected result:
  VPC/Subnet consistency: CONSISTENT
  Subnet capacity: NOT SUFFICIENT
  Additional usable IP addresses needed: 49
]